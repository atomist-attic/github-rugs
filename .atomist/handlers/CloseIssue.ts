import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("CloseIssue", "Close a github issue")
@Tags("github", "issues")
@Secrets("user/github/token?scope=repo")
@Intent("close issue")
class CloseIssueCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @MappedParameter(MappedParameters.REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "close-github-issue", parameters: this},
        onSuccess: new Message(`${this.owner}/${this.repo}#${this.issue} successfully closed`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to close issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new CloseIssueCommand()
