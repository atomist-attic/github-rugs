import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {handleErrors, handleSuccess} from '@atomist/rugs/operations/CommonHandlers'
import {Repository, ReactionContent} from '../../GithubApi'

@CommandHandler("ReactGitHubIssue", "React to a GitHub issue")
@Tags("github", "issues", "reactions")
@Secrets("github://user_token?scopes=repo")
class ReactIssueCommand implements HandleCommand {

    @Parameter({description: "The reaction to add", pattern: "^\\+1|\\-1|laugh|confused|heart|hooray$"})
    reaction: string

    @Parameter({description: "The issue number", pattern: "^\\d+$"})
    issue: string

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @MappedParameter("atomist://correlation_id")
    corrid: string

    handle(ctx: HandlerContext): Plan {
        const ghRepo = new Repository(this.owner, this.repo)
        const ghIssue = ghRepo.issue(Number(this.issue))
        const http = ghIssue.react({ "content": <ReactionContent> this.reaction })

        const plan = new Plan();
        const execute = { instruction: {
            name: "http",
            kind: "execute",
            parameters: http
        }}
        handleErrors(execute, this);
        handleSuccess(execute, `Successfully reacted with :${this.reaction}: to ${this.owner}/${this.repo}/issues/#${this.issue}`);
        plan.add(execute);
        return plan;
    }
}

export let comment = new ReactIssueCommand()
