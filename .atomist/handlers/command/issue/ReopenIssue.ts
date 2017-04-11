import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {handleErrors} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("ReopenGitHubIssue", "Reopen a closed GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("reopen issue")
class ReopenIssueCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let exec = execute( "reopen-github-issue", this)
        plan.add(handleErrors(exec,this))
        return plan;
    }
}

export let command = new ReopenIssueCommand()
