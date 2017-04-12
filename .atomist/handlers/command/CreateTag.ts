import {CommandHandler, Intent, MappedParameter, Parameter, ParseJson, ResponseHandler, Secrets, Tags} from "@atomist/rug/operations/Decorators";
import {Execute, HandleCommand, HandlerContext, HandleResponse, Instruction, MappedParameters, Plan, Respond, Respondable , Response} from "@atomist/rug/operations/Handlers";
import {wrap} from "@atomist/rugs/operations/CommonHandlers";
import {renderError, renderSuccess} from "@atomist/rugs/operations/messages/MessageRendering";
import {execute} from "@atomist/rugs/operations/PlanUtils";

@CommandHandler("CreateGitHubTag", "Create a tag from a sha")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("create tag")
class CreateTagCommand implements HandleCommand {

    @Parameter({description: "The tag to release", pattern: "^.*$"})
    tag: string;

    @Parameter({description: "The sha to tag", pattern: "^.*$"})
    sha: string;

    @Parameter({description: "The message for the tag", pattern: "@any"})
    message: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string;

    @MappedParameter("atomist://correlation_id")
    corrid: string;

    handle(ctx: HandlerContext): Plan {
        const plan = new Plan();
        const ex = execute("create-github-tag", this);
        plan.add(wrap(ex, `Successfully created a new tag on ${this.owner}/${this.repo}#${this.sha}`, this));
        return plan;
    }
}

export let command = new CreateTagCommand();
