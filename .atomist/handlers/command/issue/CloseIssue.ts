import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("CloseGithubIssue", "Close a GitHub issue")
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

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "close-github-issue", parameters: this},
        onSuccess: {kind: "respond", name: "GenericSuccessHandler", parameters: {msg: `${this.owner}/${this.repo}#${this.issue} successfully closed`}},
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to close issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new CloseIssueCommand()
