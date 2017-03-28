import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {wrap, exec} from '../../Common'

@CommandHandler("ReactGitHubIssueComment", "React to a GitHub issue comment")
@Tags("github", "issues", "comments", "reactions")
@Secrets("github://user_token?scopes=repo")
@Intent("react issue comment")
class ReactIssueCommentCommand implements HandleCommand {

    @Parameter({description: "The reaction to add", pattern: "^+1|-1|laugh|confused|heart|hooray$"})
    reaction: string

    @Parameter({description: "The issue ID", pattern: "^.*$"})
    issueId: string

    @Parameter({description: "The comment ID", pattern: "^.*$"})
    commentId: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute = exec("react-github-issue-comment", this)
        plan.add(wrap(execute,`Successfully reacted with :${this.reaction}: to ${this.owner}/${this.repo}/issues/#${this.issueId}/comments/${this.commentId}`,this))
        return plan;
    }
}

export let comment = new ReactIssueCommentCommand()
