import { Executor } from "@atomist/rug/operations/Executor"
import { Services } from "@atomist/rug/model/Core"
import { Result, Status, Parameter } from "@atomist/rug/operations/RugOperation"

import { GitHubService } from "@atomist/github/core/Core"

import { RepoUserToken, Owner, Repository } from './Parameters'

interface Parameters {
    number: number
    comment: string
    owner: string
    repo: string
    token: string
}

var commentIssue: Executor = {
    description: "Close a GitHub issue",
    name: "CommentIssue",
    tags: ["atomist/intent=add comment", "atomist/intent=create comment", "atomist/private=false"],
    parameters: [
        // TODO proper patterns and validation
        { name: "number", description: "Issue Number", pattern: "^.*$", maxLength: 100, required: true },
        { name: "comment", description: "Issue Comment", pattern: "^.*$", maxLength: 100, required: true },
        Owner, Repository, RepoUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let status = githubService.commentIssue(p.number, p.comment, p.owner, p.repo, p.token)
        _services.messageBuilder().say(status.message()).send()
        if (status.success()) {
            return new Result(Status.Success, "OK")
        }
        else {
            return new Result(Status.Error, status.message())
        }
    }
}
