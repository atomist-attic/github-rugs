import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/Issue()[/resolvedBy::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?[/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/belongsTo::Repo()/channel::ChatChannel()]", m => {
   let issue = m.root() as any

   // temp work around for path expression reflection issue
   if (issue.state() != "open") {
     return
   }

   let message = atomist.messageBuilder().regarding(issue)

   let assign = message.actionRegistry().findByName("AssignIssue|Assign")
   assign = message.actionRegistry().bindParameter(assign, "number", issue.number())
   assign = message.actionRegistry().bindParameter(assign, "repo", issue.belongsTo().name())
   assign = message.actionRegistry().bindParameter(assign, "owner", issue.belongsTo().owner())
   message.withAction(assign)

   let bug = message.actionRegistry().findByName("LabelIssue|Bug")
   bug = message.actionRegistry().bindParameter(bug, "number", issue.number())
   bug = message.actionRegistry().bindParameter(bug, "label", "bug")
   bug = message.actionRegistry().bindParameter(bug, "repo", issue.belongsTo().name())
   bug = message.actionRegistry().bindParameter(bug, "owner", issue.belongsTo().owner())
   message.withAction(bug)

   let enhancement = message.actionRegistry().findByName("LabelIssue|Enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "number", issue.number())
   enhancement = message.actionRegistry().bindParameter(enhancement, "label", "enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "repo", issue.belongsTo().name())
   enhancement = message.actionRegistry().bindParameter(enhancement, "owner", issue.belongsTo().owner())
   message.withAction(enhancement)

   let close = message.actionRegistry().findByName("CloseIssue|Close")
   close = message.actionRegistry().bindParameter(close, "number", issue.number())
   close = message.actionRegistry().bindParameter(close, "repo", issue.belongsTo().name())
   close = message.actionRegistry().bindParameter(close, "owner", issue.belongsTo().owner())
   message.withAction(close)

   let comment = message.actionRegistry().findByName("CommentIssue|Comment")
   comment = message.actionRegistry().bindParameter(comment, "number", issue.number())
   comment = message.actionRegistry().bindParameter(comment, "repo", issue.belongsTo().name())
   comment = message.actionRegistry().bindParameter(comment, "owner", issue.belongsTo().owner())
   message.withAction(comment)

   let cid = "issue/" + issue.belongsTo().owner() + "/" + issue.belongsTo().name() + "/" + issue.number()

   message.withCorrelationId(cid).send()
})

atomist.on<TreeNode, TreeNode>("/Issue()[/resolvedBy::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?[/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/belongsTo::Repo()/channel::ChatChannel()]", m => {
   let issue = m.root() as any

   // temp work around for path expression reflection issue
   if (issue.state() != "closed") {
     return
   }

   let message = atomist.messageBuilder().regarding(issue)

   let reopen = message.actionRegistry().findByName("ReopenIssue|Reopen")
   reopen = message.actionRegistry().bindParameter(reopen, "number", issue.number())
   reopen = message.actionRegistry().bindParameter(reopen, "repo", issue.belongsTo().name())
   reopen = message.actionRegistry().bindParameter(reopen, "owner", issue.belongsTo().owner())
   message.withAction(reopen)
   
   let cid = "issue/" + issue.belongsTo().owner() + "/" + issue.belongsTo().name() + "/" + issue.number()

   message.withCorrelationId(cid).send()
})

atomist.on<TreeNode, TreeNode>("/Comment()[/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/on::Issue()[/belongsTo::Repo()/channel::ChatChannel()][/by::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/resolvedBy::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?]", m => {
   let issueComment = m.root() as any

   let message = atomist.messageBuilder().regarding(issueComment)

   let assign = message.actionRegistry().findByName("AssignIssue|Assign")
   assign = message.actionRegistry().bindParameter(assign, "number", issueComment.on().number())
   assign = message.actionRegistry().bindParameter(assign, "repo", issueComment.on().belongsTo().name())
   assign = message.actionRegistry().bindParameter(assign, "owner", issueComment.on().belongsTo().owner())
   message.withAction(assign)

   let bug = message.actionRegistry().findByName("LabelIssue|Bug")
   bug = message.actionRegistry().bindParameter(bug, "number", issueComment.on().number())
   bug = message.actionRegistry().bindParameter(bug, "label", "bug")
   bug = message.actionRegistry().bindParameter(bug, "repo", issueComment.on().belongsTo().name())
   bug = message.actionRegistry().bindParameter(bug, "owner", issueComment.on().belongsTo().owner())
   message.withAction(bug)

   let enhancement = message.actionRegistry().findByName("LabelIssue|Enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "number", issueComment.on().number())
   enhancement = message.actionRegistry().bindParameter(enhancement, "label", "enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "repo", issueComment.on().belongsTo().name())
   enhancement = message.actionRegistry().bindParameter(enhancement, "owner", issueComment.on().belongsTo().owner())
   message.withAction(enhancement)

   let close = message.actionRegistry().findByName("CloseIssue|Close")
   close = message.actionRegistry().bindParameter(close, "number", issueComment.on().number())
   close = message.actionRegistry().bindParameter(close, "repo", issueComment.on().belongsTo().name())
   close = message.actionRegistry().bindParameter(close, "owner", issueComment.on().belongsTo().owner())
   message.withAction(close)

   let comment = message.actionRegistry().findByName("CommentIssue|Comment")
   comment = message.actionRegistry().bindParameter(comment, "number", issueComment.on().number())
   comment = message.actionRegistry().bindParameter(comment, "repo", issueComment.on().belongsTo().name())
   comment = message.actionRegistry().bindParameter(comment, "owner", issueComment.on().belongsTo().owner())
   message.withAction(comment)

   let cid = "comment/" + issueComment.on().belongsTo().owner() + "/" + issueComment.on().belongsTo().name() + "/" + issueComment.on().number() + "/" + issueComment.id()
   message.withCorrelationId(cid).send()
})
