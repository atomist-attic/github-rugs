import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {wrap, exec} from '../../Common'

@CommandHandler("CloseGitHubIssue", "Close a GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("close issue")
class CloseIssueCommand implements HandleCommand {

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
        let execute = exec("close-github-issue",this)
        plan.add(wrap(execute,`${this.owner}/${this.repo}#${this.issue} successfully closed`,this))
        return plan;
    }
}

export let command = new CloseIssueCommand()
