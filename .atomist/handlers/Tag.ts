import { HandleEvent, Message } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'


@EventHandler("Tag", "Handle tag events", 
    new PathExpression<GraphNode, GraphNode>("/Tag()"))
@Tags("github")
class Tag implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let tag = event.root() as any

        let message = new Message("")
        message.withTreeNode(tag)

        return message
    }
}
export const tag = new Tag()

