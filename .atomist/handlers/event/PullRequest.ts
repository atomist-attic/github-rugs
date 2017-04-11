import { HandleEvent, LifecycleMessage, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'

import { PullRequest } from '@atomist/cortex/PullRequest'


@EventHandler("OpenedGithubPullRequests", "Handle new pull-request events",
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='open']
            [/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/merger::GitHubId()[/person::Person()/chatId::ChatId()]?]?
            [/commits::Commit()/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/builds::Build()/repo::Repo()]?
            [/repo::Repo()/channels::ChatChannel()]`))
@Tags("github", "pr", "pull request")
class OpenedPullRequest implements HandleEvent<PullRequest, PullRequest> {
    handle(event: Match<PullRequest, PullRequest>): Plan {
        let pr = event.root()
    
        let cid = "pr_event/" + pr.repo.owner + "/" + pr.repo.name + "/" + pr.number
        let message = new LifecycleMessage(pr, cid)
        
        message.addAction({
            label: 'Merge',
            instruction: {
                kind: "command",
                name: "MergeGitHubPullRequest",
                parameters: {
                    issue: pr.number
                }
            }
        })

        return Plan.ofMessage(message);
    }
}
export const openedPullRequest = new OpenedPullRequest()


@EventHandler("ClosedGitHubPullRequests", "Handle closed pull-request events",
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='closed']
            [/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/merger::GitHubId()[/person::Person()/chatId::ChatId()]?]?
            [/commits::Commit()/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/builds::Build()/repo::Repo()]?
            [/repo::Repo()/channels::ChatChannel()]`))
@Tags("github", "pr", "pull reuqest")
class ClosedPullRequest implements HandleEvent<PullRequest, PullRequest> {
    handle(event: Match<PullRequest, PullRequest>): Plan {
        let pr = event.root()
        
        let cid = "pr_event/" + pr.repo.owner + "/" + pr.repo.name + "/" + pr.number
        let message = new LifecycleMessage(pr, cid)
        
        return Plan.ofMessage(message);
    }
}
export const closedPullRequest = new ClosedPullRequest()
