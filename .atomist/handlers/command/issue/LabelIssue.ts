import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("label-github-issue", "Add a known label to an GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("label github issue", "label issue")
class LabelIssueCommand implements HandleCommand {

    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "A known label to add to an issue", pattern: "^.*$"})
    label: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "label-github-issue", parameters: this},
        onSuccess: {kind: "respond", name: "generic-success-handler", parameters: {msg: `Successfully labelled ${this.owner}/${this.repo}#${this.issue} with ${this.label}`}},
        onError: {kind: "respond", name: "generic-error-handler", parameters: {msg: "Failed to label issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new LabelIssueCommand()
