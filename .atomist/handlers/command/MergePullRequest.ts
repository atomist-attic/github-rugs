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
    Secrets,
    Tags,
} from "@atomist/rug/operations/Decorators";

import {
    CommandPlan,
    HandleCommand,
    HandlerContext,
    MappedParameters,
} from "@atomist/rug/operations/Handlers";

import { handleErrors } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("MergeGitHubPullRequest", "merge a GitHub pull request")
@Tags("github", "pr")
@Secrets("github://user_token?scopes=repo")
@Intent("merge pr", "merge pullrequest")
class MergePullRequestCommand implements HandleCommand {

    @Parameter({
        displayName: "Pull Request Number",
        description: "the number of the pull request number to merge, with no leading `#`",
        pattern: "^\\d+$",
        validInput: "an open GitHub pull request number",
        minLength: 1,
        maxLength: 10,
        required: true,
    })
    public issue: number;

    @Parameter({
        displayName: "Merge Method",
        description: "the method to use when merging the pull request",
        pattern: "^(?:merge|squash|rebase)$",
        validInput: "one of 'merge', 'squash', or 'rebase', see " +
        "https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button",
        minLength: 5,
        maxLength: 6,
        required: false,
    })
    public mergeMethod: string = "merge";

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
        const ex = execute("merge-github-pull-request", this);
        plan.add(handleErrors(ex, this));
        return plan;
    }
}

export const command = new MergePullRequestCommand();
