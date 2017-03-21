import { HandleEvent, Message } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'


@EventHandler("Built", "Handle build events", 
    new PathExpression<GraphNode, GraphNode>(
        `/Build
            [/hasBuild::Commit()/author::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/on::Repo()/channel::ChatChannel()]
            [/triggeredBy::Push()
                [/contains::Commit()/author::GitHubId()
                    [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/on::Repo()]]`))
@Tags("ci")
class Built implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let build = event.root() as any

        let message = new Message("")
        message.withNode(build)

        let repo = build.on().name()

        let cid = "commit_event/" + build.on().owner() + "/" + repo + "/" + build.hasBuild().sha()
        message.withCorrelationId(cid)


        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            if (build.status() == "Fixed") {
                if (build.hasBuild().author().hasGithubIdentity() != null) {
                    message.body = `Travis CI build ${build.name()} of repo ${repo} is now fixed`
                    message.channelId = build.hasBuild().author().hasGitHubIdentity().hasChatIdentity().id()
                }
            }
            message.addAction({
                label: 'Release',
                instruction: {
                    kind: "command", 
                    name: "CreateRelease", 
                    parameters: { 
                        owner: build.on().owner(),
                        repo: build.on().name()
                    }
                }
            })
        }
        else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
            if (build.hasBuild().author().hasGithubIdentity() != null) {
                let commit = "`" + build.hasBuild().sha() + "`"
                message.body = `Travis CI build ${build.name()} of repo ${repo} failed after your last commit ${commit}: ${build.build_url()}`
                message.channelId = build.hasBuild().author().hasGitHubIdentity().hasChatIdentity().id()
            }
            message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command", 
                    name: "RestartTravisBuild", 
                    parameters: { 
                        buildId: build.id(),
                        org: build.on().owner()
                    }
                }
            })
        }
        
        return message
    }
}
export const built = new Built()


@EventHandler("PRBuilt", "Handle build events from pull-requests", 
    new PathExpression<GraphNode, GraphNode>(
        `/Build()
            [/on::Repo()/channel::ChatChannel()]
            [/triggeredBy::PullRequest()
                [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/on::Repo()]]`))
@Tags("ci")
class PRBuilt implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let build = event.root() as any

        let message = new Message("")
        message.withNode(build)

        let cid = "commit_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.hasBuild().sha()
        message.withCorrelationId(cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            message.addAction({
                label: 'Release',
                instruction: {
                    kind: "command", 
                    name: "CreateRelease", 
                    parameters: { 
                        owner: build.on().owner(),
                        repo: build.on().name()
                    }
                }
            })
        }
        else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
            message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command", 
                    name: "RestartTravisBuild", 
                    parameters: { 
                        buildId: build.id(),
                        org: build.on().owner()
                    }
                }
            })
        }
        
        return message
    }
}
export const prBuilt = new PRBuilt()
