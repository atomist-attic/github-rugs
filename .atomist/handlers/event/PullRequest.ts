import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'


@EventHandler("OpenedGithubPullRequests", "Handle new pull-request events", 
    new PathExpression<GraphNode, GraphNode>(
        `/PullRequest()[@state='open']
            [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/triggeredBy::Build()/on::Repo()]?
            [/on::Repo()/channel::ChatChannel()]`))
@Tags("github", "pr", "pull request")
class OpenedPullRequest implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message | Plan {
        let pr = event.root() as any

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
                    number: pr.number()
                }
            }
        })

        return message
    }
}
export const openedPullRequest = new OpenedPullRequest()


@EventHandler("ClosedGitHubPullRequests", "Handle closed pull-request events",
    new PathExpression<GraphNode, GraphNode>(
        `/PullRequest()[@state='closed']
            [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/triggeredBy::Build()/on::Repo()]?
            [/on::Repo()/channel::ChatChannel()]`))
@Tags("github", "pr", "pull reuqest")
class ClosedPullRequest implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message | Plan {
        let pr = event.root() as any

        let message = new Message()
        message.withNode(pr)

        let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.number()
        message.withCorrelationId(cid)

        return message
    }
}
export const closedPullRequest = new ClosedPullRequest()
