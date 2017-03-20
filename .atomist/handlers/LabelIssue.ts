import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("LabelIssue", "Add a known label to an issue")
@Tags("github", "issues")
@Secrets("user/github/token?scope=repo")
@Intent("label issue")
class LabelIssueCommand implements HandleCommand {

    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "A known label to add to an issue", pattern: "^.*$"})
    label: string

    @MappedParameter(MappedParameters.REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "label-github-issue", parameters: this},
        onSuccess: new Message(`Successfully labelled ${this.owner}/${this.repo}#${this.issue} with ${this.label}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to label issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new LabelIssueCommand()
