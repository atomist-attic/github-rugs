import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'

@CommandHandler("InstallOrgWebhook", "Create a webhook for a whole organization")
@Tags("github", "webhooks")
@Secrets("user/github/token?scope=repo")
@Intent("install org-webhook")
class CreateOrgWebHookCommand implements HandleCommand {
    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    @Parameter({description: "Webhook URL", pattern: "@url"})
    url: string = "https://webhook.atomist.com/github"

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "install-github-org-webhook", parameters: this},
        onSuccess: new Message(`Successfully installed new webook on ${this.owner}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to install webhook: "}}}
        plan.add(execute)
        return plan;
    }
}

export let command = new CreateOrgWebHookCommand()

@CommandHandler("InstallRepoWebhook", "Create a webhook for a repo")
@Tags("github", "webhooks")
@Secrets("user/github/token?scope=repo")
@Intent("install webhook")
class InstallRepoWebhookCommand implements HandleCommand {

    @MappedParameter(MappedParameters.REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    @Parameter({description: "Webhook URL", pattern: "@url"})
    url: string = "https://webhook.atomist.com/github"

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "install-github-repo-webhook", parameters: this},
        onSuccess: new Message(`Successfully installed new webook on ${this.owner}/${this.repo}`),
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to install webhook: "}}}
        plan.add(execute)
        return plan;
    }
}

export let repo = new InstallRepoWebhookCommand()
