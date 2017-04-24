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
import { renderError, renderIssues, renderSuccess } from "@atomist/rugs/operations/messages/MessageRendering";
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
