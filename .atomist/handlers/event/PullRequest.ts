import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'

import { PullRequest } from '@atomist/cortex/PullRequest'


@EventHandler("OpenedGithubPullRequests", "Handle new pull-request events", 
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='open']
            [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/triggeredBy::Build()/on::Repo()]?
            [/on::Repo()/channel::ChatChannel()]`))
@Tags("github", "pr", "pull request")
class OpenedPullRequest implements HandleEvent<PullRequest, PullRequest> {
    handle(event: Match<PullRequest, PullRequest>): Message | Plan {
        let pr = event.root()

        let message = new Message()
        message.withNode(pr)

        let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.number()
        message.withCorrelationId(cid)

        message.addAction({
            label: 'Merge',
            instruction: {
                kind: "command", 
                name: "MergeGitHubPullRequest",
                parameters: { 
                    issue: pr.number()
                }
            }
        })

        return message
    }
}
export const openedPullRequest = new OpenedPullRequest()


@EventHandler("ClosedGitHubPullRequests", "Handle closed pull-request events",
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='closed']
            [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/triggeredBy::Build()/on::Repo()]?
            [/on::Repo()/channel::ChatChannel()]`))
@Tags("github", "pr", "pull reuqest")
class ClosedPullRequest implements HandleEvent<PullRequest, PullRequest> {
    handle(event: Match<PullRequest, PullRequest>): Message | Plan {
        let pr = event.root() as any

        let message = new Message()
        message.withNode(pr)

        let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.number()
        message.withCorrelationId(cid)

        return message
    }
}
export const closedPullRequest = new ClosedPullRequest()

@EventHandler("AutoMergePullRequests", "Auto-merge PRs if they are approved", 
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='open']
            [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/triggeredBy::Build()/on::Repo()]?
            [/on::Repo()/channel::ChatChannel()]`))
@Tags("github", "pr", "pull reuqest")
class AutoMergePullRequests implements HandleEvent<PullRequest, PullRequest> {
    handle(event: Match<PullRequest, PullRequest>): Message {
        let pr = event.root() as any
        //TODO get all this from nodes above!
        let num: number = pr.number
        let repo: string = pr.repo
        let owner: string = pr.owner

        let msg = new Message();
        
        msg.addAction({
            instruction: {kind: "command", name: "MergeGithubPullRequest", parameters: {issue: num, repo: repo, owner: owner}}
        })
        return msg;
    }
}

//export const auto = new AutoMergePullRequests()