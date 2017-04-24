import {
    CommandHandler,
    Intent,
    MappedParameter,
    Parameter,
    ParseJson,
    ResponseHandler,
    Secrets,
    Tags,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan,
    HandleCommand,
    HandlerContext,
    HandleResponse,
    MappedParameters,
    Response,
} from "@atomist/rug/operations/Handlers";

import { wrap } from "@atomist/rugs/operations/CommonHandlers";
import { renderError, renderSuccess } from "@atomist/rugs/operations/messages/MessageRendering";
import { execute } from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("CreateGitHubTag", "Create a tag from a sha")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("create tag")
class CreateTagCommand implements HandleCommand {

    @Parameter({ description: "The tag to release", pattern: "^.*$" })
    public tag: string;

    @Parameter({ description: "The sha to tag", pattern: "^.*$" })
    public sha: string;

    @Parameter({ description: "The message for the tag", pattern: "@any" })
    public message: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const ex = execute("create-github-tag", this);
        plan.add(wrap(ex, `Successfully created a new tag on ${this.owner}/${this.repo}#${this.sha}`, this));
        return plan;
    }
}

export let command = new CreateTagCommand();
