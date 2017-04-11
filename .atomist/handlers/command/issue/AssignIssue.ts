import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, ResponseMessage} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {Issue} from '@atomist/cortex/Issue'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap, handleErrors} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess, renderIssues} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("AssignGitHubIssue", "Assign a GitHub issue to a user")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("assign issue")
class AssignIssueCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "The user to whom the issue should be assigned", pattern: "^.*$"})
    assignee: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let exec = execute("assign-github-issue",this)
        plan.add(wrap(exec, `${this.owner}/${this.repo}#${this.issue} successfully assigned to ${this.assignee}`, this))

        let message = new ResponseMessage("this is a test")
        plan.add(message)

        return plan;
    }
}

export let assignIssue = new AssignIssueCommand()
