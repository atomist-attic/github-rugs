import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'

@EventHandler("OpenGithubIssues", "Handle created issue events", new PathExpression<GraphNode, GraphNode>("/Issue()[/resolvedBy::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?[/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/belongsTo::Repo()/channel::ChatChannel()]"))
@Tags("github", "issue")
class OpenedIssue implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message | Plan {
        let issue = event.root() as any

        if (issue.state() != "open") {
            return new Plan()
        }

        let message = new Message("New issue")
        message.withNode(issue)

        let cid = "issue/" + issue.belongsTo().owner() + "/" + issue.belongsTo().name() + "/" + issue.number()
        message.withCorrelationId(cid)

        // the assignee will be asked by the bot
        message.addAction({
            label: 'Assign',
            instruction: {
                kind: "command",
                name: "AssignGithubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name()
                }
            }
        })

        message.addAction({
            label: 'Bug',
            instruction: {
                kind: "command",
                name: "LabelGithubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name(),
                    label: 'Bug'
                }
            }
        })

        message.addAction({
            label: 'Enhancement',
            instruction: {
                kind: "command",
                name: "LabelGithubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name(),
                    label: 'Enhancement'
                }
            }
        })

        message.addAction({
            label: 'Close',
            instruction: {
                kind: "command",
                name: "CloseGithubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name(),
                }
            }
        })

        // the comment will be asked by the bot
        message.addAction({
            label: 'Comment',
            instruction: {
                kind: "command",
                name: "CommentGithubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name(),
                }
            }
        })

        return message
    }
}
export const openedIssue = new OpenedIssue()


@EventHandler("ClosedGithubIssues", "Handles closed issue events", new PathExpression<GraphNode, GraphNode>("/Issue()[/resolvedBy::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?[/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/belongsTo::Repo()/channel::ChatChannel()]"))
@Tags("github", "issue")
class ClosedIssue implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message | Plan {
        let issue = event.root() as any

        if (issue.state() != "closed") {
            return new Plan()
        }

        let message = new Message()
        message.withNode(issue)

        let cid = "issue/" + issue.belongsTo().owner() + "/" + issue.belongsTo().name() + "/" + issue.number()
        message.withCorrelationId(cid)

        message.addAction({
            label: 'Reopen',
            instruction: {
                kind: "command",
                name: "ReopenGithubIssue", 
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name()
                }
            }
        })

        return message
    }
}
export const closedIssue = new ClosedIssue()



@EventHandler("CommentedGithubIssues", "Handles issue comments events", new PathExpression<GraphNode, GraphNode>("/Comment()[/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/on::Issue()[/belongsTo::Repo()/channel::ChatChannel()][/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/resolvedBy::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?]"))
@Tags("github", "issue", "comment")
class CommentedIssue implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message {
        let comment = event.root() as any

        let message = new Message()
        message.withNode(comment)

        let cid = "comment/" + comment.on().belongsTo().owner() + "/" + comment.on().belongsTo().name() + "/" + comment.on().number() + "/" + comment.id()
        message.withCorrelationId(cid)

        // the assignee will be asked by the bot
        message.addAction({
            label: 'Assign',
            instruction: {
                kind: "command",
                name: "AssignGithubIssue",
                parameters: {
                    issue: comment.number(),
                    owner: comment.belongsTo().owner(),
                    repo: comment.belongsTo().name()
                }
            }
        })

        message.addAction({
            label: 'Bug',
            instruction: {
                kind: "command",
                name: "LabelGithubIssue",
                parameters: {
                    issue: comment.number(),
                    owner: comment.belongsTo().owner(),
                    repo: comment.belongsTo().name(),
                    label: 'Bug'
                }
            }
        })

        message.addAction({
            label: 'Enhancement',
            instruction: {
                kind: "command",
                name: "LabelGithubIssue",
                parameters: {
                    issue: comment.number(),
                    owner: comment.belongsTo().owner(),
                    repo: comment.belongsTo().name(),
                    label: 'Enhancement'
                }
            }
        })

        message.addAction({
            label: 'Close',
            instruction: {
                kind: "command",
                name: "CloseGithubIssue",
                parameters: {
                    issue: comment.number(),
                    owner: comment.belongsTo().owner(),
                    repo: comment.belongsTo().name(),
                }
            }
        })

        // the comment will be asked by the bot
        message.addAction({
            label: 'Comment',
            instruction: {
                kind: "command",
                name: "CommentGithubIssue",
                parameters: {
                    issue: comment.number(),
                    owner: comment.belongsTo().owner(),
                    repo: comment.belongsTo().name(),
                }
            }
        })

        return message
    }
}
export const commentedIssue = new CommentedIssue()
