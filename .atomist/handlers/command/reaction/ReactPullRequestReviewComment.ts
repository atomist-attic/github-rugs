import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {handleErrors, handleSuccess} from '@atomist/rugs/operations/CommonHandlers'

@CommandHandler("ReactGitHubPullRequestComment", "React to a GitHub pull request review comment")
@Tags("github", "pull requests", "comments", "reactions")
@Secrets("github://user_token?scopes=repo")
@Intent("react pull request comment")
class ReactGitHubPullRequestCommentCommand implements HandleCommand {

    @Parameter({description: "The reaction to add", pattern: "^\\+1|\\-1|laugh|confused|heart|hooray$"})
    reaction: string

    @Parameter({description: "The pull request ID", pattern: "^.*$"})
    pullRequestId: string

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
        let execute = {instruction: {kind: "execute", name: "react-github-pull-request-review-comment", parameters: this}};
        handleErrors(execute, this);
        handleSuccess(execute, `Successfully reacted with :${this.reaction}: to ${this.owner}/${this.repo}/pulls/#${this.pullRequestId}/comments/${this.commentId}`);
        plan.add(execute);
        return plan;
    }
}

export let comment = new ReactGitHubPullRequestCommentCommand()
