import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {handleErrors, handleSuccess} from '@atomist/rugs/operations/CommonHandlers'

@CommandHandler("ReactGitHubCommitComment", "React to a GitHub commit comment")
@Tags("github", "commits", "comments", "reactions")
@Secrets("github://user_token?scopes=repo")
@Intent("react commit comment")
class ReactCommitCommentCommand implements HandleCommand {

    @Parameter({description: "The reaction to add", pattern: "^\\+1|\\-1|laugh|confused|heart|hooray$"})
    reaction: string

    @Parameter({description: "The sha1 referencing the commit", pattern: "^.*$"})
    sha1: string

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
        let execute = {instruction: {kind: "execute", name: "react-github-commit-comment", parameters: this}};
        handleErrors(execute, this);
        handleSuccess(execute, `Successfully reacted with :${this.reaction}: to ${this.owner}/${this.repo}/${this.sha1}/comments/${this.comment}`);
        plan.add(execute);
        return plan;
    }
}

export let comment = new ReactCommitCommentCommand()
