import {HandleResponse, Execute, Respondable, MappedParameters, HandleCommand, Respond, Response, HandlerContext, Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import { Issue } from "@atomist/github/core/Core"
import * as slack from '../../SlackTemplates'
import {handleErrors, exec} from '../../Common'

@CommandHandler("ListGitHubIssues", "List user's GitHub issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("list issues")
class ListIssuesCommand implements HandleCommand {
    
    @Parameter({description: "Number of days to search", pattern: "^.*$"})
    days: number = 1

    @MappedParameter("atomist://correlation_id")
    corrid: string
    
    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute = exec("list-github-user-issues", this)
        execute.onSuccess = {kind: "respond", name: "DisplayGitHubIssues"}
        plan.add(handleErrors(execute, this))
        return plan;
    }
}

@CommandHandler("ListGitHubRepositoryIssues", "List a GitHub repo's issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("open issues")
class ListRepositoryIssuesCommand implements HandleCommand {
    
    @Parameter({description: "Issue search term", pattern: "^.*$", required: false})
    search: string = ""

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    repo: string

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    owner: string

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = {instruction:
        {kind: "execute", name: "search-github-issues", parameters: this},
        onSuccess: {kind: "respond", name: "DisplayGitHubIssues"},
        onError: {kind: "respond", name: "GenericErrorHandler", parameters: {msg: "Failed to list issues: "}}}
        plan.add(execute)
        return plan;
    }
}

@ResponseHandler("DisplayGitHubIssues", "Formats GitHub issues list for display in slack")
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
            return new Message(`No issues found for the last ${this.days} day(s)`)
        }
    }
}

let command = new ListIssuesCommand()
let render = new ListIssuesRender()
let repo = new ListRepositoryIssuesCommand()

export {command, render, repo}