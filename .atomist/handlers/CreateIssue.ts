import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("CreateIssue", "Create an issue on GitHub")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repos")
@Intent("create issue")
class CreateIssueCommand implements HandleCommand {

    @Parameter({description: "The issue body", pattern: "^.*(?m)$"})
    body: string

    @Parameter({description: "The issue title", pattern: "^.*$"})
    title: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "create-github-issue", parameters: this},
        onSuccess: new Message(`Successfully created a new issue on ${this.owner}/${this.repo}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to create issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let create = new CreateIssueCommand()
