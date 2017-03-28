import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {Issue} from '@atomist/cortex/Issue'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap, handleErrors} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess, renderIssues} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("CreateGitHubIssue", "Create an issue on GitHub")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("create issue")
class CreateIssueCommand implements HandleCommand {

    @Parameter({description: "The issue title", pattern: "^.*$"})
    title: string

    @Parameter({description: "The issue body", pattern: "^.*(?m)$"})
    body: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let exec = execute( "create-github-issue", this)
        plan.add(wrap(exec, `Successfully created a new issue on ${this.owner}/${this.repo}`,  this))
        return plan;
    }
}

export let create = new CreateIssueCommand()
