import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("CommentIssue", "Comment on a GitHub issue")
@Tags("github", "issues")
@Secrets("user/github/token?scope=repo")
@Intent("comment issue")
class CommentIssueCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "The comment", pattern: "@any"})
    comment: string

    @MappedParameter(MappedParameters.REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "comment-github-issue", parameters: this},
        onSuccess: new Message(`Successfully labelled ${this.owner}/${this.repo}#${this.issue}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to comment on issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let comment = new CommentIssueCommand()
