import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { HandleEvent, LifecycleMessage, Plan } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";

import { Comment } from "@atomist/cortex/Comment";
import { Issue } from "@atomist/cortex/Issue";

@EventHandler("OpenGitHubIssues", "Handle created issue events",
    new PathExpression<Issue, Issue>(
        `/Issue()[@state='open']
            [/resolvingCommits::Commit()/author::GitHubId()
                [/person::Person()/chatId::ChatId()]?]?
            [/openedBy::GitHubId()
                [/person::Person()/chatId::ChatId()]?]
            [/repo::Repo()/channels::ChatChannel()]
            [/labels::Label()]?`))
@Tags("github", "issue")
class OpenedIssue implements HandleEvent<Issue, Issue> {
    handle(event: Match<Issue, Issue>): Plan {

        const issue = event.root();

        const cid = "issue/" + issue.repo.owner + "/" + issue.repo.name + "/" + issue.number;
        const message = new LifecycleMessage(issue, cid);

        // the assignee will be asked by the bot
        message.addAction({
            label: "Assign",
            instruction: {
                kind: "command",
                name: "AssignGitHubIssue",
                parameters: {
                    issue: issue.number,
                    owner: issue.repo.owner,
                    repo: issue.repo.name,
                },
            },
        });

        message.addAction({
            label: "Label",
            instruction: {
                kind: "command",
                name: "AddLabelGitHubIssue",
                parameters: {
                    issue: issue.number,
                    owner: issue.repo.owner,
                    repo: issue.repo.name,
                },
            },
        });

        message.addAction({
            label: "Close",
            instruction: {
                kind: "command",
                name: "CloseGitHubIssue",
                parameters: {
                    issue: issue.number,
                    owner: issue.repo.owner,
                    repo: issue.repo.name,
                },
            },
        });

        // the comment will be asked by the bot
        message.addAction({
            label: "Comment",
            instruction: {
                kind: "command",
                name: "CommentGitHubIssue",
                parameters: {
                    issue: issue.number,
                    owner: issue.repo.owner,
                    repo: issue.repo.name,
                },
            },
        });

        message.addAction({
            label: ":+1:",
            instruction: {
                kind: "command",
                name: "ReactGitHubIssue",
                parameters: {
                    reaction: "+1",
                    issue: issue.number,
                    owner: issue.repo.owner,
                    repo: issue.repo.name,
                },
            },
        });

        return Plan.ofMessage(message);
    }
}
export const openedIssue = new OpenedIssue();

@EventHandler("ClosedGitHubIssues", "Handles closed issue events",
    new PathExpression<Issue, Issue>(
        `/Issue()[@state='closed']
            [/resolvingCommits::Commit()/author::GitHubId()
                [/person::Person()/chatId::ChatId()]?]?
            [/openedBy::GitHubId()
                [/person::Person()/chatId::ChatId()]?]
            [/closedBy::GitHubId()
                [/person::Person()/chatId::ChatId()]?]?
            [/repo::Repo()/channels::ChatChannel()]
            [/labels::Label()]?`))
@Tags("github", "issue")
class ClosedIssue implements HandleEvent<Issue, Issue> {
    handle(event: Match<Issue, Issue>): Plan {
        const issue = event.root();

        const cid = "issue/" + issue.repo.owner + "/" + issue.repo.name + "/" + issue.number;
        const message = new LifecycleMessage(issue, cid);

        message.addAction({
            label: "Reopen",
            instruction: {
                kind: "command",
                name: "ReopenGitHubIssue",
                parameters: {
                    issue: issue.number,
                    owner: issue.repo.owner,
                    repo: issue.repo.name,
                },
            },
        });

        return Plan.ofMessage(message);
    }
}
export const closedIssue = new ClosedIssue();

@EventHandler("CommentedGitHubIssues", "Handles issue comments events",
    new PathExpression<Comment, Comment>(
        `/Comment()
            [/by::GitHubId()
                [/person::Person()/chatId::ChatId()]?]
            [/issue::Issue()
                [/repo::Repo()/channels::ChatChannel()]
                [/openedBy::GitHubId()[/person::Person()/chatId::ChatId()]?]
                [/resolvingCommits::Commit()/author::GitHubId()
                    [/person::Person()/chatId::ChatId()]?]?
                [/labels::Label()]?]`))
@Tags("github", "issue", "comment")
class CommentedIssue implements HandleEvent<Comment, Comment> {
    handle(event: Match<Comment, Comment>): Plan {
        const comment = event.root();
        const cid = "comment/" + comment.issue.repo.owner + "/" + comment.issue.repo.name + "/" + comment.issue.number + "/" + comment.id;

        const message = new LifecycleMessage(comment, cid);

        // the assignee will be asked by the bot
        message.addAction({
            label: "Assign",
            instruction: {
                kind: "command",
                name: "AssignGitHubIssue",
                parameters: {
                    issue: comment.issue.number,
                    owner: comment.issue.repo.owner,
                    repo: comment.issue.repo.name,
                },
            },
        });

        message.addAction({
            label: "Label",
            instruction: {
                kind: "command",
                name: "AddLabelGitHubIssue",
                parameters: {
                    issue: comment.issue.number,
                    owner: comment.issue.repo.owner,
                    repo: comment.issue.repo.name,
                },
            },
        });

        message.addAction({
            label: "Close",
            instruction: {
                kind: "command",
                name: "CloseGitHubIssue",
                parameters: {
                    issue: comment.issue.number,
                    owner: comment.issue.repo.owner,
                    repo: comment.issue.repo.name,
                },
            },
        });

        // the comment will be asked by the bot
        message.addAction({
            label: "Comment",
            instruction: {
                kind: "command",
                name: "CommentGitHubIssue",
                parameters: {
                    issue: comment.issue.number,
                    owner: comment.issue.repo.owner,
                    repo: comment.issue.repo.name,
                },
            },
        });

        message.addAction({
            label: ":+1:",
            instruction: {
                kind: "command",
                name: "ReactGitHubIssueComment",
                parameters: {
                    reaction: "+1",
                    issue: comment.issue.number,
                    comment: comment.id,
                    owner: comment.issue.repo.owner,
                    repo: comment.issue.repo.name,
                },
            },
        });

        return Plan.ofMessage(message);
    }
}
export const commentedIssue = new CommentedIssue();
