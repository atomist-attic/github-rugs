import { Executor } from "@atomist/rug/operations/Executor"
import { Services } from "@atomist/rug/model/Core"
import { Result, Status, Parameter } from "@atomist/rug/operations/RugOperation"

import { GitHubService } from "@atomist/github/core/Core"

import { Owner, Repository, RepoHookUserToken, OrgHookUserToken } from './Parameters'

interface Parameters {
  owner: string
  repo: string
  token: string
}

let url = "https://webhook.atomist.com/github"

export let installOrgWebhook: Executor = {
    description: "Install organization level webhook",
    name: "InstallOrgWebhook",
    tags: ["atomist/intent=install org-webhook", "atomist/private=false"],
    parameters: [
        Owner, OrgHookUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let status = githubService.installWebhook(url, p.owner, null, p.token)
        _services.messageBuilder().say(status.message()).send()
        if (status.success()) {
            return new Result(Status.Success, "OK")
        }
        else {
            return new Result(Status.Error, status.message())
        }
    }
}

export let installRepoWebhook: Executor = {
    description: "Install repository level webhook",
    name: "InstallRepoWebhook",
    tags: ["atomist/intent=install webhook", "atomist/private=false"],
    parameters: [
        Owner, Repository, RepoHookUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let status = githubService.installWebhook(url, p.owner, p.repo, p.token)
        _services.messageBuilder().say(status.message()).send()
        if (status.success()) {
            return new Result(Status.Success, "OK")
        }
        else {
            return new Result(Status.Error, status.message())
        }
    }
}
