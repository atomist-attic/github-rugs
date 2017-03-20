import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("AssignIssue", "Assign a github issue to a user")
@Tags("github", "issues")
@Secrets("user/github/token?scope=repo")
@Intent("assign issue")
class AssignCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "The user to whom the issue should be assigned", pattern: "^.*$"})
    assignee: string

    @MappedParameter(MappedParameters.REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "assign-github-issue", parameters: this},
        onSuccess: new Message(`${this.owner}/${this.repo}#${this.issue} successfully assigned to ${this.assignee}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to assign issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let assignIssue = new AssignCommand()
