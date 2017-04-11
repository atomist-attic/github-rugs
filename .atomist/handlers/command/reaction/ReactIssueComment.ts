import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {handleErrors, handleSuccess} from '@atomist/rugs/operations/CommonHandlers'

@CommandHandler("ReactGitHubIssueComment", "React to a GitHub issue comment")
@Tags("github", "issues", "comments", "reactions")
@Secrets("github://user_token?scopes=repo")
class ReactIssueCommentCommand implements HandleCommand {

    @Parameter({description: "The reaction to add", pattern: "^\\+1|\\-1|laugh|confused|heart|hooray$"})
    reaction: string

    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: string

    @Parameter({description: "The comment number", pattern: "^.*$"})
    comment: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute = {instruction: {kind: "execute", name: "react-github-issue-comment", parameters: this}};
        handleErrors(execute, this);
        handleSuccess(execute, `Successfully reacted with :${this.reaction}: to ${this.owner}/${this.repo}/issues/#${this.issue}/comments/${this.comment}`);
        plan.add(execute);
        return plan;
    }
}

export let comment = new ReactIssueCommentCommand()
