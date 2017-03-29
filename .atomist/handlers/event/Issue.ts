import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'

import { Comment } from '@atomist/cortex/Comment'

@EventHandler("OpenGitHubIssues", "Handle created issue events",
    new PathExpression<GraphNode, GraphNode>(
        `/Issue()[@state='open']
            [/resolvedBy::Commit()/author::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/by::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/belongsTo::Repo()/channel::ChatChannel()]
            [/labelled::Label()]?`))
@Tags("github", "issue")
class OpenedIssue implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message | Plan {
        let issue = event.root() as any

        let message = new Message("New issue")
        message.withNode(issue)

        let cid = "issue/" + issue.belongsTo().owner() + "/" + issue.belongsTo().name() + "/" + issue.number()
        message.withCorrelationId(cid)

        // the assignee will be asked by the bot
        message.addAction({
            label: 'Assign',
            instruction: {
                kind: "command",
                name: "AssignGitHubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name()
                }
            }
        })

        message.addAction({
            label: 'Label',
            instruction: {
                kind: "command",
                name: "AddLabelGitHubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name()
                }
            }
        })

        message.addAction({
            label: 'Close',
            instruction: {
                kind: "command",
                name: "CloseGitHubIssue",
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
                name: "CommentGitHubIssue",
                parameters: {
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name(),
                }
            }
        })

        message.addAction({
            label: ':+1:',
            instruction: {
                kind: "command",
                name: "ReactGitHubIssue",
                parameters: {
                    reaction: "+1",
                    issue: issue.number(),
                    owner: issue.belongsTo().owner(),
                    repo: issue.belongsTo().name()
                }
            }
        })

        return message
    }
}
export const openedIssue = new OpenedIssue()


@EventHandler("ClosedGitHubIssues", "Handles closed issue events",
    new PathExpression<GraphNode, GraphNode>(
        `/Issue()[@state='closed']
            [/resolvedBy::Commit()/author::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
            [/by::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/belongsTo::Repo()/channel::ChatChannel()]
            [/labelled::Label()]?`))
@Tags("github", "issue")
class ClosedIssue implements HandleEvent<GraphNode, GraphNode> {
    handle(event: Match<GraphNode, GraphNode>): Message | Plan {
        let issue = event.root() as any

        let message = new Message()
        message.withNode(issue)

        let cid = "issue/" + issue.belongsTo().owner() + "/" + issue.belongsTo().name() + "/" + issue.number()
        message.withCorrelationId(cid)

        message.addAction({
            label: 'Reopen',
            instruction: {
                kind: "command",
                name: "ReopenGitHubIssue",
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



@EventHandler("CommentedGitHubIssues", "Handles issue comments events",
    new PathExpression<GraphNode, GraphNode>(
        `/Comment()
            [/by::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/on::Issue()
                [/belongsTo::Repo()/channel::ChatChannel()]
            [/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
            [/resolvedBy::Commit()/author::GitHubId()
                [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?]
            [/labelled::Label()]?`))
@Tags("github", "issue", "comment")
class CommentedIssue implements HandleEvent<Comment, Comment> {
    handle(event: Match<Comment, Comment>): Message {
        let comment = event.root()

        let message = new Message()
        message.withNode(comment)

        let cid = "comment/" + comment.on().belongsTo().owner() + "/" + comment.on().belongsTo().name() + "/" + comment.on().number() + "/" + comment.id()
        message.withCorrelationId(cid)

        // the assignee will be asked by the bot
        message.addAction({
            label: 'Assign',
            instruction: {
                kind: "command",
                name: "AssignGitHubIssue",
                parameters: {
                    issue: comment.on().number(),
                    owner: comment.on().belongsTo().owner(),
                    repo: comment.on().belongsTo().name()
                }
            }
        })

        message.addAction({
            label: 'Label',
            instruction: {
                kind: "command",
                name: "AddLabelGitHubIssue",
                parameters: {
                    issue: comment.on().number(),
                    owner: comment.on().belongsTo().owner(),
                    repo: comment.on().belongsTo().name()
                }
            }
        })

        message.addAction({
            label: 'Close',
            instruction: {
                kind: "command",
                name: "CloseGitHubIssue",
                parameters: {
                    issue: comment.on().number(),
                    owner: comment.on().belongsTo().owner(),
                    repo: comment.on().belongsTo().name(),
                }
            }
        })

        // the comment will be asked by the bot
        message.addAction({
            label: 'Comment',
            instruction: {
                kind: "command",
                name: "CommentGitHubIssue",
                parameters: {
                    issue: comment.on().number(),
                    owner: comment.on().belongsTo().owner(),
                    repo: comment.on().belongsTo().name(),
                }
            }
        })

         message.addAction({
            label: ':+1:',
            instruction: {
                kind: "command",
                name: "ReactGitHubIssue",
                parameters: {
                    reaction: "+1",
                    issue: comment.on().number(),
                    owner: comment.on().belongsTo().owner(),
                    repo: comment.on().belongsTo().name()
                }
            }
        })

        return message
    }
}
export const commentedIssue = new CommentedIssue()
