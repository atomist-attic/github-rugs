import {CommandHandler, Intent, MappedParameter, Parameter, ParseJson, ResponseHandler, Secrets, Tags} from "@atomist/rug/operations/Decorators";
import {Execute, HandleCommand, HandlerContext, HandleResponse, Instruction, MappedParameters, Plan, Respond, Respondable , Response} from "@atomist/rug/operations/Handlers";

import {handleErrors} from "@atomist/rugs/operations/CommonHandlers";
import {execute} from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("MergeGitHubPullRequest", "Merge a GitHub pull request")
@Tags("github", "pr")
@Secrets("github://user_token?scopes=repo")
@Intent("merge pr", "merge pullrequest")
class MergePullRequestCommand implements HandleCommand {

    @Parameter({description: "The pull request number", pattern: "^.*$"})
    issue: number;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string;

    @MappedParameter("atomist://correlation_id")
    corrid: string;

    handle(ctx: HandlerContext): Plan {
        const plan = new Plan();
        const ex = execute("merge-github-pull-request", this);
        plan.add(handleErrors(ex, this));
        return plan;
    }
}

export let command = new MergePullRequestCommand();
