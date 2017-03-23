import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("comment-github-issue", "Comment on a GitHub issue")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("comment github issue", "comment issue")
class CommentIssueCommand implements HandleCommand {
    
    @Parameter({description: "The issue number", pattern: "^.*$"})
    issue: number

    @Parameter({description: "The comment", pattern: "@any"})
    comment: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "comment-github-issue", parameters: this},
        onSuccess: {kind: "respond", name: "generic-success-handler", parameters: {msg: `Successfully labelled ${this.owner}/${this.repo}#${this.issue}`}},
        onError: {kind: "respond", name: "generic-error-handler", parameters: {msg: "Failed to comment on issue: "}}}
        plan.add(execute)
        return plan;
    }
}

export let comment = new CommentIssueCommand()
