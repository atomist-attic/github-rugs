import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {Issue} from '@atomist/cortex/Issue'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap, handleErrors} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess, renderIssues} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("AddLabelGitHubIssue", "Add a known label to an GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("add label issue")
class AddLabelIssueCommand implements HandleCommand {

    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "A known label to add to an issue", pattern: "^.*$"})
    label: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let ex = execute("add-label-github-issue", this)
        plan.add(wrap(ex,`Successfully labelled ${this.owner}/${this.repo}#${this.issue} with ${this.label}`, this))
        return plan;
    }
}

export let command = new AddLabelIssueCommand()
