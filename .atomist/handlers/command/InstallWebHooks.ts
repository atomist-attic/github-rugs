/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    MessageMimeTypes,
    Respond,
    Response,
    ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { wrap } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";
import { renderError, renderSuccess } from "@atomist/slack-messages/RugMessages";
import {
    bold,
} from "@atomist/slack-messages/SlackMessages";

@CommandHandler("InstallGitHubOrgWebhook", "Create a webhook for a whole organization")
@Tags("github", "webhooks")
@Secrets("github://user_token?scopes=admin:org_hook")
@Intent("install org-webhook")
class CreateOrgWebHookCommand implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_webhook_url")
    public url: string = "https://webhook.atomist.com/github";

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com";

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const ex = execute("install-github-org-webhook", this);
        ex.onSuccess = success(this.owner, this.url),
            ex.onError = { kind: "respond", name: "GitHubWebhookErrors", parameters: this };
        plan.add(ex);
        return plan;
    }
}

export let command = new CreateOrgWebHookCommand();

@CommandHandler("InstallRepoWebhook", "Create a webhook for a repo")
@Tags("github", "webhooks")
@Secrets("github://user_token?scopes=repo")
@Intent("install webhook")
class InstallRepoWebhookCommand implements HandleCommand {

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_webhook_url")
    public url: string = "https://webhook.atomist.com/github";

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com";

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        plan.add({
            instruction: {
                kind: "execute",
                name: "install-github-repo-webhook",
                parameters: this,
            },
            onError: {
                kind: "respond",
                name: "GitHubWebhookErrors",
                parameters: this,
            },
            onSuccess: success(this.owner, this.url, this.repo),
        });
        return plan;
    }
}

// Reusable creation of formatted success messages
function success(owner: string, webhookUrl: string, repoName?: string): Respond {
    const target = !repoName ? owner : `${owner}/${repoName}`;
    const webhookType = !repoName ? "Org" : "Repository";
    return {
        kind: "respond",
        name: "GenericSuccessHandler",
        parameters: {
            // tslint:disable-next-line:max-line-length
            msg: `Thanks to you it's Bring Your Bot to Work Day!\n${webhookType} webhook installed for ${bold(target)}`,
        },
    };
}

@ResponseHandler("GitHubWebhookErrors", "Custom error handling for some cases")
class WebHookErrorHandler implements HandleResponse<any> {

    @Parameter({ description: "Repo", pattern: "@any", required: false })
    public repo: string;

    @Parameter({ description: "Owner", pattern: "@any" })
    public owner: string;

    @Parameter({ description: "Webhook URL", pattern: "@url" })
    public url: string;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    public handle( @ParseJson response: Response<any>): CommandPlan {
        const errors = response.body.errors;
        try {
            if (errors[0].message === "Hook already exists on this organization") {
                return CommandPlan.ofMessage(
                    renderSuccess(`Webhook already installed for ${this.owner} (${this.url})`));
            }
            if (errors[0].message === "Hook already exists on this repository") {
                return CommandPlan.ofMessage(
                    renderSuccess(`Webhook already installed for ${this.owner}/${this.repo} (${this.url})`));
            }
            return CommandPlan.ofMessage(renderError(`${response.msg}: ${errors[0].message}`));
        } catch (ex) {
            return CommandPlan.ofMessage(renderError(`Failed to install webhook: ${response.body.message}`));
        }
    }
}

export let webhookErrors = new WebHookErrorHandler();
export let repo = new InstallRepoWebhookCommand();
