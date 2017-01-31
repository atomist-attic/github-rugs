import { Executor } from "@atomist/rug/operations/Executor"
import { Services } from "@atomist/rug/model/Core"
import { Result, Status, Parameter } from "@atomist/rug/operations/RugOperation"

import { GitHubService } from "@atomist/github/core/Core"

import { RepoUserToken, Owner, Repository } from './Parameters'

interface Parameters {
    number: number
    owner: string
    repo: string
    token: string
}

var mergePullRequest: Executor = {
    description: "Merge a GitHub PullRequest",
    name: "MergePullRequest",
    tags: ["atomist/intent=merge pr", "atomist/intent=merge pullrequest", "atomist/private=false"],
    parameters: [
        // TODO proper patterns and validation
        { name: "number", description: "Pull Request Number", pattern: "^.*$", maxLength: 100, required: true },
        Owner, Repository, RepoUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let status = githubService.mergePullRequest(p.number, p.owner, p.repo, p.token)
        _services.messageBuilder().say(status.message()).send()
        if (status.success()) {
            return new Result(Status.Success, "OK")
        }
        else {
            return new Result(Status.Error, status.message())
        }
    }
}
