import { Executor } from "@atomist/rug/operations/Executor"
import { Services } from "@atomist/rug/model/Core"
import { Result, Status, Parameter } from "@atomist/rug/operations/RugOperation"

import { GitHubService, Issue } from "@atomist/github/core/Core"

import { RepoUserToken, Owner, Repository } from './Parameters'

interface Parameters {
    search: string
    owner: string
    repo: string
    token: string
}

var listRepositoryIssues: Executor = {
    description: "List repository GitHub issues",
    name: "ListRepositoryIssues",
    tags: ["atomist/intent=open issues", "atomist/private=false"],
    parameters: [
        { name: "search", description: "Search Text", pattern: "^.*$", maxLength: 100, required: false, displayable: true},
        Owner, Repository, RepoUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let issues: Issue[] = githubService.listIssues(p.search, p.owner, p.repo, p.token)

        if (issues.length > 0) {
            let attachments = `{"text":"The search returned *${issues.length}* matching issue(s):", "attachments": [` + issues.map(i => {
                let text = JSON.stringify(`#${i.number()}: ${i.title()}`)
                return `{
                "fallback": ${text},
                "author_icon": "http://images.atomist.com/rug/issue-open.png",
                "color": "#6cc644",
                "author_link": "${i.issueUrl()}",
                "author_name": ${text}
             }`
            }).join(",") + "]}"
            _services.messageBuilder().say(attachments).send()
        }
        else {
            _services.messageBuilder().say(`No open issues on ${p.owner}/${p.repo}`).send()
        }
        return new Result(Status.Success, "OK")
    }
}
