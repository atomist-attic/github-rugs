import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("CreateTag", "Create a tag from a sha")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repos")
@Intent("create tag")
class CreateTagCommand implements HandleCommand {

    @Parameter({description: "The tag to release", pattern: "^.*$"})
    tag: string

    @Parameter({description: "The sha to tag", pattern: "^.*$"})
    sha: string

    @Parameter({description: "The message for the tag", pattern: "@any"})
    message: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "create-github-tag", parameters: this},
        onSuccess: new Message(`Successfully created a new tag on ${this.owner}/${this.repo}#${this.sha}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to create tag: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new CreateTagCommand()
