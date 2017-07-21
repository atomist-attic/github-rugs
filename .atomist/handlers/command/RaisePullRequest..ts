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

import { ChatTeam } from "@atomist/cortex/ChatTeam";

import { Pattern } from "@atomist/rug/operations/RugOperation";

import { handleErrors } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

import { replaceChatIdWithGitHubId } from "./issue/Helpers";

@CommandHandler("RaiseGitHubPullRequest", "Raise a GitHub pull request")
@Tags("github", "pr")
@Secrets("github://user_token?scopes=repo")
@Intent("raise pr", "raise pullrequest")
class RaisePullRequestCommand implements HandleCommand {

    @Parameter({ description: "The pull request title", pattern: "^.*$" })
    public title: string;

    @Parameter({ description: "The pull request body", pattern: Pattern.any,
        required: false })
    public body: string;

    @Parameter({ description: "Branch the changes should get pulled into",
        pattern: "^.*$" })
    public base: string;

    @Parameter({ description: "The branch containing the changes",
        pattern: "^.*$" })
    public head: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        this.body = replaceChatIdWithGitHubId(this.body, ctx.pathExpressionEngine, ctx.contextRoot as ChatTeam);
        const ex = execute("raise-github-pull-request", this);
        plan.add(handleErrors(ex, this));
        return plan;
    }
}

export let command = new RaisePullRequestCommand();
