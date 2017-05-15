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

import { Issue } from "@atomist/cortex/Issue";
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
    Execute,
    HandleCommand,
    HandlerContext,
    HandleResponse,
    Instruction,
    MappedParameters,
    Respond,
    Response,
} from "@atomist/rug/operations/Handlers";
import { handleErrors, wrap } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("AddLabelGitHubIssue", "Add a known label to a GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("add label issue")
class AddLabelIssueCommand implements HandleCommand {

    @Parameter({ description: "The issue number", pattern: "^.*$" })
    public issue: number;

    @Parameter({ description: "A known label to add to an issue", pattern: "^.*$" })
    public label: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const ex = execute("add-label-github-issue", this);
        plan.add(handleErrors(ex, this));
        return plan;
    }
}

export let command = new AddLabelIssueCommand();
