import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("CreateGitHubTag", "Create a tag from a sha")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
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

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let ex = execute("create-github-tag", this)
        plan.add(wrap(ex,`Successfully created a new tag on ${this.owner}/${this.repo}#${this.sha}`,this))
        return plan;
    }
}

export let command = new CreateTagCommand()
