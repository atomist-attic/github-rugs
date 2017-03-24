import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {renderSuccess, renderError} from '../SlackTemplates'

@CommandHandler("CreateGithubRelease", "Create a release of a repo on GitHub")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("create github release", "create release")
class CreateReleaseCommand implements HandleCommand {

    @Parameter({description: "The tag to release", pattern: "^.*$"})
    tag: string

    @Parameter({description: "The release message", pattern: "@any"})
    message: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "create-github-release", parameters: this},
        onSuccess: {kind: "respond", name: "GenericSuccessHandler", parameters: {msg: `Successfully created a new release on ${this.owner}/${this.repo}#${this.tag}`}},
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to create release: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new CreateReleaseCommand()
