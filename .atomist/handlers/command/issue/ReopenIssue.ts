import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {renderSuccess, renderError} from '../../SlackTemplates'
import {wrap, exec} from '../../Common'

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
        let execute = exec( "reopen-github-issue", this)
        plan.add(wrap(execute,`${this.owner}/${this.repo}#${this.issue} successfully reopened`, this))
        return plan;
    }
}

export let command = new ReopenIssueCommand()
