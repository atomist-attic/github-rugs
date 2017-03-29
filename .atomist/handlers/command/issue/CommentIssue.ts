import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {Issue} from '@atomist/cortex/Issue'
import {execute} from '@atomist/rugs/operations/PlanUtils'
import {wrap, handleErrors} from '@atomist/rugs/operations/CommonHandlers'
import {renderError, renderSuccess, renderIssues} from '@atomist/rugs/operations/messages/MessageRendering'

@CommandHandler("CommentGitHubIssue", "Comment on a GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("comment issue")
class CommentIssueCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "The comment", pattern: "@any"})
    comment: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string
    
    @MappedParameter("atomist://correlation_id")
    corrid: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let exec = execute("comment-github-issue", this)
        plan.add(handleErrors(exec,this))
        return plan;
    }
}

export let comment = new CommentIssueCommand()
