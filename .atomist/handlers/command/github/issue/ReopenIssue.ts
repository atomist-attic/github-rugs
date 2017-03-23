import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("ReopenIssue", "Reopen a closed GitHub issue")
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

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "reopen-github-issue", parameters: this},
        onSuccess: new Message(`${this.owner}/${this.repo}#${this.issue} successfully reopened`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to reopen issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new ReopenIssueCommand()
