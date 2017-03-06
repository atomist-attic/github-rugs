import {HandleResponse, Execute, Respondable, MappedParameters, HandleCommand, Respond, Response, HandlerContext, Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import { Issue } from "@atomist/github/core/Core"
import * as slack from './SlackTemplates'

@CommandHandler("ListIssues", "List user's GitHub issues")
@Tags("github", "issues")
@Secrets("user/github/token?scope=repo")
@Intent("list issues")
class ListIssuesCommand implements HandleCommand {
    
    @Parameter({description: "Number of days to search", pattern: "^.*$"})
    days: number = 1

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "list-github-user-issues", parameters: this},
        onSuccess: {kind: "respond", name: "DisplayIssues"},
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to list issues: "}}}
        plan.add(execute)
        return plan;
    }
}

@CommandHandler("ListRepositoryIssues", "List a GitHub repo's issues")
@Tags("github", "issues")
@Secrets("user/github/token?scope=repo")
@Intent("open issues")
class ListRepositoryIssuesCommand implements HandleCommand {
    
    @Parameter({description: "Issue search term", pattern: "^.*$", required: false})
    search: string = ""

    @MappedParameter(MappedParameters.REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "search-github-issues", parameters: this},
        onSuccess: {kind: "respond", name: "DisplayIssues"},
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to list issues: "}}}
        plan.add(execute)
        return plan;
    }
}

@ResponseHandler("DisplayIssues", "Formats Github issues list for display in slack")
class ListIssuesRender implements HandleResponse<Issue[]> {
    
    @Parameter({description: "Number of days to search", pattern: "^.*$"})
    days: number = 1

    handle(@ParseJson response: Response<Issue[]>): Message {
        let issues = response.body();
        if(issues.length >= 1){
          let rendered = slack.renderIssues(issues)
          return new Message(rendered)
        }
        else {
            return new Message(`Looks like you really didn't crush it. No issues found for the last ${this.days} day(s)`)
        }
    }
}

let command = new ListIssuesCommand()
let render = new ListIssuesRender()
let repo = new ListRepositoryIssuesCommand()

export {command, render, repo}