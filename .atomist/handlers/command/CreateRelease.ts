import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("CreateGitHubRelease", "Create a release of a repo on GitHub")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("create release")
class CreateReleaseCommand implements HandleCommand {

    @Parameter({description: "The tag to release", pattern: "^.*$"})
    tag: string

    @Parameter({description: "The release message", pattern: "@any"})
    message: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let ex = execute("create-github-release", this)
        plan.add(wrap(ex,`Successfully created a new release on ${this.owner}/${this.repo}#${this.tag}`, this))
        return plan;
    }
}

export let command = new CreateReleaseCommand()
