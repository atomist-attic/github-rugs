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
    HandleCommand,
    HandlerContext,
    HandleResponse,
    MappedParameters,
    MessageMimeTypes,
    Response,
    ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { handleErrors, wrap } from "@atomist/rugs/operations/CommonHandlers";
import { renderError, renderIssues, renderSuccess } from "@atomist/rugs/operations/messages/MessageRendering";
import { execute } from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("ListGitHubIssues", "List user's GitHub issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("list issues")
class ListIssuesCommand implements HandleCommand {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    public days: number = 1;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const exec = execute("list-github-user-issues", this);
        exec.onSuccess = { kind: "respond", name: "DisplayGitHubIssues", parameters: { days: this.days } };
        plan.add(handleErrors(exec, this));
        return plan
    }
}

@CommandHandler("ListGitHubRepositoryIssues", "List a GitHub repo's issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("open issues")
class ListRepositoryIssuesCommand implements HandleCommand {

    @Parameter({ description: "Issue search term", pattern: "^.*$", required: false })
    public search: string = "";

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    public handle(ctx: HandlerContext): CommandPlan {
        // Bot sends null for search if it is no specified
        if (!this.search) {
            this.search = "";
        }

        const plan = new CommandPlan();

        plan.add({
            instruction: {
                kind: "execute",
                name: "search-github-issues",
                parameters: this,
            },
            onSuccess: {
                kind: "respond",
                name: "DisplayGitHubIssues",
            },
            onError: {
                kind: "respond",
                name: "GenericErrorHandler",
                parameters: {
                    msg: "Failed to list issues: ",
                },
            },
        });
        return plan;
    }
}

@ResponseHandler("DisplayGitHubIssues", "Formats GitHub issues list for display in slack")
class ListIssuesRender implements HandleResponse<Issue[]> {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    public days: number = 1;

    public handle( @ParseJson response: Response<Issue[]>): CommandPlan {
        const issues = response.body;
        if (issues.length >= 1) {
            return CommandPlan.ofMessage(renderIssues(issues));
        } else {
            return CommandPlan.ofMessage(new ResponseMessage(`No issues found for the last ${this.days} day(s)`));
        }
    }
}

const command = new ListIssuesCommand();
const render = new ListIssuesRender();
const repo = new ListRepositoryIssuesCommand();

export { command, render, repo };
