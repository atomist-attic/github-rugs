import { HandleResponse, Execute, Respondable, MappedParameters, HandleCommand, Respond, Response, HandlerContext, Plan, ResponseMessage, MessageMimeTypes } from '@atomist/rug/operations/Handlers';
import { ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent } from '@atomist/rug/operations/Decorators';
import { Issue } from '@atomist/cortex/Issue';
import { execute } from '@atomist/rugs/operations/PlanUtils';
import { wrap, handleErrors } from '@atomist/rugs/operations/CommonHandlers';
import { renderError, renderSuccess, renderIssues } from '@atomist/rugs/operations/messages/MessageRendering';

@CommandHandler("ListGitHubIssues", "List user's GitHub issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("list issues")
class ListIssuesCommand implements HandleCommand {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    days: number = 1

    @MappedParameter("atomist://correlation_id")
    corrid: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let exec = execute("list-github-user-issues", this)
        exec.onSuccess = { kind: "respond", name: "DisplayGitHubIssues" }
        plan.add(handleErrors(exec, this))
        return plan;
    }
}

@CommandHandler("ListGitHubRepositoryIssues", "List a GitHub repo's issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("open issues")
class ListRepositoryIssuesCommand implements HandleCommand {

    @Parameter({ description: "Issue search term", pattern: "^.*$", required: false })
    search: string = ""

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {
            instruction:
            { kind: "execute", name: "search-github-issues", parameters: this },
            onSuccess: { kind: "respond", name: "DisplayGitHubIssues" },
            onError: { kind: "respond", name: "GenericErrorHandler", parameters: { msg: "Failed to list issues: " } }
        }
        plan.add(execute)
        return plan;
    }
}

@ResponseHandler("DisplayGitHubIssues", "Formats GitHub issues list for display in slack")
class ListIssuesRender implements HandleResponse<Issue[]> {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    days: number = 1

    handle( @ParseJson response: Response<Issue[]>): Plan {
        let issues = response.body;
        if (issues.length >= 1) {
            return Plan.ofMessage(renderIssues(issues));
        }
        else {
            return Plan.ofMessage(new ResponseMessage(`No issues found for the last ${this.days} day(s)`));
        }
    }
}

let command = new ListIssuesCommand();
let render = new ListIssuesRender();
let repo = new ListRepositoryIssuesCommand();

export { command, render, repo }
