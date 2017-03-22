import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import {renderSuccess, renderError} from './SlackTemplates'

@CommandHandler("InstallOrgWebhook", "Create a webhook for a whole organization")
@Tags("github", "webhooks")
@Secrets("github://user_token?scopes=repos")
@Intent("install org-webhook")
class CreateOrgWebHookCommand implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @Parameter({description: "Webhook URL", pattern: "@url"})
    url: string = "https://webhook.atomist.com/github"

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "install-github-org-webhook", parameters: this},
        onSuccess: success(this.owner, this.url),
        onError: {kind: "respond", name: "WebHookErrorHandler", parameters: this}}
        plan.add(execute)
        return plan;
    }
}

export let command = new CreateOrgWebHookCommand()

@CommandHandler("InstallRepoWebhook", "Create a webhook for a repo")
@Tags("github", "webhooks")
@Secrets("github://user_token?scopes=repos")
@Intent("install webhook")
class InstallRepoWebhookCommand implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    @Parameter({description: "Webhook URL", pattern: "@url"})
    url: string = "https://webhook.atomist.com/github"

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "install-github-repo-webhook", parameters: this},
        onSuccess: success(this.owner, this.url, this.repo),
        onError: {kind: "respond", name: "WebHookErrorHandler", parameters: this}}
        plan.add(execute)
        return plan;
    }
}

//reusable creation of formatted success messages
function success(owner: string, repo: string, url?: string) : Message {
    let repoStr = repo == null ? "" : `/${repo}` 
    return new Message(renderSuccess(`Installed new webook for ${owner}${repoStr} (${url})`))
}

@ResponseHandler("WebHookErrorHandler", "Custom error handling for some cases")
class WebHookErrorHandler implements HandleResponse<any> {

    @Parameter({description: "Repo", pattern: "@any", required: false})
    repo: string;

    @Parameter({description: "Owner", pattern: "@any"})
    owner: string

    @Parameter({description: "Webhook URL", pattern: "@url"})
    url: string

    handle(@ParseJson response: Response<any>): Plan | Message {
        let errors = response.body().errors;
        try{
            if(errors[0].message == "Hook already exists for this organization"){
                return new Message(renderSuccess(`Webook already installed for ${this.owner} (${this.url})`))
            }
            if(errors[0].message == "Hook already exists for this repository"){
                return new Message(renderSuccess(`Webook already installed for ${this.owner}/${this.repo} (${this.url})`))
            }
            return new Message(renderError(`${response.msg()}: ${errors[0].message}`))    
        }catch(ex){
            return new Message(renderError(`Failed to install webhook: ${response.body().message}`))
        }
    }
}

export let errors = new WebHookErrorHandler()
export let repo = new InstallRepoWebhookCommand()
