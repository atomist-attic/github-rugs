import { HandleEvent, Message } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'


@EventHandler("Build", "Handle build events", 
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
class Build implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let build = event.root() as any

        let message = new Message("")
        message.withTreeNode(build)

        let cid = "commit_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.hasBuild().sha()
        message.withCorrelationId(cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            /*message.addAction({
                label: 'Release',
                instruction: {
                    kind: "command", 
                    name: "CreateRelease", 
                    parameters: { 
                        build_id: build.id(),
                        build_no: build.name(),
                        owner: build.on().owner(),
                        repo: build.on().name(),
                    }
                }
            })*/
        }
        else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
            /*message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command", 
                    name: "RestartBuild", 
                    parameters: { 
                        build_id: build.id(),
                        build_no: build.name(),
                        owner: build.on().owner(),
                        repo: build.on().name(),
                    }
                }
            })*/
        }
        
        return message
    }
}
export const build = new Build()


@EventHandler("BuildFromPR", "Handle build events from pull-requests", 
    new PathExpression<GraphNode, GraphNode>(
        `/Build()
            [/on::Repo()/channel::ChatChannel()]
            [/triggeredBy::PullRequest()
                [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/on::Repo()]]`))
@Tags("ci")
class BuildFromPR implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let build = event.root() as any

        let message = new Message("")
        message.withTreeNode(build)

        let cid = "commit_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.hasBuild().sha()
        message.withCorrelationId(cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            /*message.addAction({
                label: 'Release',
                instruction: {
                    kind: "command", 
                    name: "CreateRelease", 
                    parameters: { 
                        build_id: build.id(),
                        build_no: build.name(),
                        owner: build.on().owner(),
                        repo: build.on().name(),
                    }
                }
            })*/
        }
        else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
            /*message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command", 
                    name: "RestartBuild", 
                    parameters: { 
                        build_id: build.id(),
                        build_no: build.name(),
                        owner: build.on().owner(),
                        repo: build.on().name(),
                    }
                }
            })*/
        }
        
        return message
    }
}
export const buildFromPR = new BuildFromPR()