import { HandleEvent, Message } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'


@EventHandler("Push", "Handle push events", 
    new PathExpression<GraphNode, GraphNode>(
        `/Push()
            [/on::Repo()/channel::ChatChannel()]
            [/contains::Commit()/author::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]`))
@Tags("github")
class Push implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let push = event.root() as any

        let message = new Message("")
        message.withTreeNode(push)

        let cid = "commit_event/" + push.on().owner() + "/" + push.on().name() + "/" + push.after()
        message.withCorrelationId(cid)

        return message
    }
}
export const push = new Push()

