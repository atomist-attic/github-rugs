import {CommandHandler, Intent, MappedParameter, Parameter, ParseJson, ResponseHandler, Secrets,
    Tags} from "@atomist/rug/operations/Decorators";
import {Execute, HandleCommand, HandlerContext, HandleResponse, Instruction, MappedParameters, Plan, Respond,
    Respondable, Response} from "@atomist/rug/operations/Handlers";
import {handleErrors, handleSuccess} from "@atomist/rugs/operations/CommonHandlers";
import {ReactionContent, Repository} from "../../GitHubApi";

@CommandHandler("ReactGitHubIssue", "React to a GitHub issue")
@Tags("github", "issues", "reactions")
@Secrets("github://user_token?scopes=repo")
class ReactIssueCommand implements HandleCommand {

    @Parameter({description: "The reaction to add", pattern: "^\\+1|\\-1|laugh|confused|heart|hooray$"})
    public reaction: string;

    @Parameter({description: "The issue number", pattern: "^\\d+$"})
    public issue: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): Plan {
        const ghRepo = new Repository(this.owner, this.repo, `#{github://user_token?scopes=repo}`);
        const ghIssue = ghRepo.issue(Number(this.issue));
        const http = ghIssue.react({ content: this.reaction as ReactionContent});

        const plan = new Plan();
        const execute = { instruction: {
            kind: "execute",
            name: "http",
            parameters: http,
        }};

        handleErrors(execute, this);
        const msg = `Successfully reacted with :${this.reaction}: to ${this.owner}/${this.repo}/issues/#${this.issue}`;
        handleSuccess(execute, msg);
        plan.add(execute);
        return plan;
    }
}

export let comment = new ReactIssueCommand()
