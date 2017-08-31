/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    CommandHandler,
    Intent,
    MappedParameter,
    Parameter,
    ParseJson,
    ResponseHandler,
    Secrets,
    Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan,
    HandleCommand,
    HandlerContext,
    HandleResponse,
    MappedParameters,
    Response,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";

import { handleErrors } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

import { ChatTeam } from "@atomist/cortex/ChatTeam";

import { replaceChatIdWithGitHubId } from "./Helpers";
import { GitHubIssue, renderIssues } from "./ListIssues";

@CommandHandler("CreateGitHubIssue", "Create an issue on GitHub")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("create issue")
class CreateIssueCommand implements HandleCommand {

    @Parameter({
        displayName: "Issue Title",
        description: "title of issue",
        pattern: "^.*$",
        validInput: "a single line of text",
        minLength: 1,
        maxLength: 120,
        required: true,
    })
    public title: string;

    @Parameter({
        displayName: "Issue Body",
        description: "descriptive text for issue",
        pattern: Pattern.any,
        validInput: "free text, up to 1000 characters",
        minLength: 0,
        maxLength: 1000,
        required: false,
    })
    public body: string = "";

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

    @MappedParameter(MappedParameters.SLACK_CHANNEL_NAME)
    public channelName: string;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        this.body = trimQuotes(replaceChatIdWithGitHubId(
            this.body, ctx.pathExpressionEngine, ctx.contextRoot as ChatTeam));
        const exec = execute("create-github-issue", this);
        if (repoIsMappedToChannel(ctx, this.repo, this.owner, this.channelName)) {
            // The issue event will appear in the channel. We don't need to post it.
        } else {
            exec.onSuccess = {
                kind: "respond", name: CreateIssueRender.handlerName,
                parameters: {
                    corrid: this.corrid,
                    owner: this.owner,
                    repository: this.repo,
                    apiUrl: this.apiUrl,
                },
            };
        }
        plan.add(handleErrors(exec, this));
        return plan;
    }

}

function repoIsMappedToChannel(ctx: HandlerContext, repository: string, owner: string, channelName: string) {
    const queryString =
        `/channels::ChatChannel()[@name='${channelName}'][/repos::Repo()[@name='${repository}'][@owner='${owner}']]`;
    const match = ctx.pathExpressionEngine.evaluate(
        ctx.contextRoot,
        queryString);
    return match && match.matches && match.matches.length > 0;
}

function trimQuotes(original: string): string {
    return original.replace(
        /^"(.*)"$/, "$1").replace(
        /^'(.*)'$/, "$1");
}

interface GitHubServicesIssue {
    number: number;
    id: number;
    title: string;
    url: string; // API url
    body: string;
    state: string;
}

function guessGitHubHtmlUrl(apiUrl: string) {
    return apiUrl.replace("api.", "");
}

@ResponseHandler(CreateIssueRender.handlerName, "Formats a GitHub issues for display in slack")
class CreateIssueRender implements HandleResponse<GitHubServicesIssue> {

    public static handlerName = "CreateIssueRender";

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    @Parameter({description: "Repo", pattern: "^.*$", required: false})
    public repository: string;

    @Parameter({description: "Owner", pattern: "^.*$", required: false})
    public owner: string;

    @Parameter({description: "GitHub api url", pattern: "^.*$"})
    public apiUrl: string = "https://api.github.com/";

    public handle(@ParseJson response: Response<GitHubServicesIssue>): CommandPlan {

        const paltryIssue = response.body;
        const repoUrl = `${guessGitHubHtmlUrl(this.apiUrl)}/${this.owner}/${this.repository}`;
        const htmlUrl = `${repoUrl}/issues/${paltryIssue.number}`;
        const gitHubIssue: GitHubIssue = {
            ...paltryIssue,
            number: paltryIssue.number.toString(),
            url: htmlUrl,
            issueUrl: htmlUrl,
            assignee: undefined,
            repo: `${this.owner}/${this.repository}`,
            ts: undefined,
            commits: undefined,
        };

        const issues = [gitHubIssue];
        const plan = new CommandPlan();
        plan.add(renderIssues(issues, null, 1, null, 1, 2,
            null, null, null, null));
        return plan;
    }
}

export let create = new CreateIssueCommand();
export let respond = new CreateIssueRender();
