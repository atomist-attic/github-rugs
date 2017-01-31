import { Executor } from "@atomist/rug/operations/Executor"
import { Services } from "@atomist/rug/model/Core"
import { Result, Status, Parameter } from "@atomist/rug/operations/RugOperation"

import { GitHubService, Issue } from "@atomist/github/core/Core"

import { RepoUserToken } from './Parameters'

interface Parameters {
    days: number
    token: string
}

var listIssues: Executor = {
    description: "List user's GitHub issues",
    name: "ListIssues",
    tags: ["atomist/intent=list issues", "atomist/private=false"],
    parameters: [
        // TODO proper patterns and validation
        { name: "days", description: "Days", pattern: "^.*$", maxLength: 100, required: false, default: "1" },
        RepoUserToken
    ],
    execute(services: Services, p: Parameters): Result {

        let _services: any = services
        let githubService = _services.github() as GitHubService
        let issues: Issue[] = githubService.listIssues(p.days, p.token)

        if (issues.length > 0) {
            let attachments = `{"attachments": [` + issues.map(i => {
                let text = JSON.stringify(`#${i.number()}: ${i.title()}`)
                if (i.state() == "closed") {
                    return `{
                  "fallback": ${text},
                  "author_icon": "http://images.atomist.com/rug/issue-closed.png",
                  "color": "#bd2c00",
                  "author_link": "${i.issueUrl()}",
                  "author_name": ${text}
               }`
                }
                else {
                    return `{
                "fallback": ${text},
                "author_icon": "http://images.atomist.com/rug/issue-open.png",
                "color": "#6cc644",
                "author_link": "${i.issueUrl()}",
                "author_name": ${text}
             }`
                }
            }).join(",") + "]}"
            _services.messageBuilder().say(attachments).send()
        }
        else {
            _services.messageBuilder().say(`Looks like you really didn't crush it. No issues found for the last ${p.days} day(s)`).send()
        }
        return new Result(Status.Success, "OK")
    }
}
