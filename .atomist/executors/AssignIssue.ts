import { Executor } from "@atomist/rug/operations/Executor"
import { Services } from "@atomist/rug/model/Core"
import { Result, Status, Parameter } from "@atomist/rug/operations/RugOperation"

import { GitHubService } from "@atomist/github/core/Core"

import { Owner, Repository, RepoUserToken } from './Parameters'

interface Parameters {
    number: number
    assignee: string
    owner: string
    repo: string
    token: string
}

var assignIssue: Executor = {
    description: "Assign a GitHub issue",
    name: "AssignIssue",
    tags: ["atomist/intent=assign issue", "atomist/private=false"],
    parameters: [
        // TODO proper patterns and validation
        { name: "number", description: "Issue Number", pattern: "^.*$", maxLength: 100, required: true },
        { name: "assignee", description: "Assignee", pattern: "^.*$", maxLength: 100, required: true },
        Owner, Repository, RepoUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let status = githubService.assignIssue(p.number, p.assignee, p.owner, p.repo, p.token)
        _services.messageBuilder().say(status.message()).send()
        if (status.success()) {
            return new Result(Status.Success, "OK")
        }
        else {
            return new Result(Status.Error, status.message())
        }
    }
}
