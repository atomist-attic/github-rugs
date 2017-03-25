import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {wrap, exec} from '../../Common'

@CommandHandler("CreateGithubIssue", "Create an issue on GitHub")
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
        let execute = exec( "create-github-issue", this)
        plan.add(wrap(execute, `Successfully created a new issue on ${this.owner}/${this.repo}`,  this))
        return plan;
    }
}

export let create = new CreateIssueCommand()
