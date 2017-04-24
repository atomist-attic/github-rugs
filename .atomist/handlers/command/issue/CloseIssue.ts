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

import { handleErrors, wrap } from "@atomist/rugs/operations/CommonHandlers";
import { renderError, renderIssues, renderSuccess } from "@atomist/rugs/operations/messages/MessageRendering";
import { execute } from "@atomist/rugs/operations/PlanUtils";

import { Issue } from "@atomist/cortex/Issue";

@CommandHandler("CloseGitHubIssue", "Close a GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("close issue")
class CloseIssueCommand implements HandleCommand {

    @Parameter({ description: "The issue number", pattern: "^.*$" })
    public issue: number;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const ex = execute("close-github-issue", this);
        plan.add(handleErrors(ex, this));
        return plan;
    }
}

export let command = new CloseIssueCommand();
