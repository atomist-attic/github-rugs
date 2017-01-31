import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/issue[.state()='open']", m => {
   let issue = m.root() as any
   let message = atomist.messageBuilder().regarding(issue)

   let assign = message.actionRegistry().findByName("AssignIssue|Assign")
   assign = message.actionRegistry().bindParameter(assign, "number", issue.number())
   assign = message.actionRegistry().bindParameter(assign, "repo", issue.repo().name())
   assign = message.actionRegistry().bindParameter(assign, "owner", issue.repo().owner())
   message.withAction(assign)

   let bug = message.actionRegistry().findByName("LabelIssue|Label as Bug")
   bug = message.actionRegistry().bindParameter(bug, "number", issue.number())
   bug = message.actionRegistry().bindParameter(bug, "label", "bug")
   bug = message.actionRegistry().bindParameter(bug, "repo", issue.repo().name())
   bug = message.actionRegistry().bindParameter(bug, "owner", issue.repo().owner())
   message.withAction(bug)

   let enhancement = message.actionRegistry().findByName("LabelIssue|Label as Enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "number", issue.number())
   enhancement = message.actionRegistry().bindParameter(enhancement, "label", "enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "repo", issue.repo().name())
   enhancement = message.actionRegistry().bindParameter(enhancement, "owner", issue.repo().owner())
   message.withAction(enhancement)

   let close = message.actionRegistry().findByName("CloseIssue|Close")
   close = message.actionRegistry().bindParameter(close, "number", issue.number())
   close = message.actionRegistry().bindParameter(close, "repo", issue.repo().name())
   close = message.actionRegistry().bindParameter(close, "owner", issue.repo().owner())
   message.withAction(close)

   let comment = message.actionRegistry().findByName("CommentIssue|Comment")
   comment = message.actionRegistry().bindParameter(comment, "number", issue.number())
   comment = message.actionRegistry().bindParameter(comment, "repo", issue.repo().name())
   comment = message.actionRegistry().bindParameter(comment, "owner", issue.repo().owner())
   message.withAction(comment)

   message.send()
})

atomist.on<TreeNode, TreeNode>("/issue[.state()='closed']", m => {
   let issue = m.root() as any
   let message = atomist.messageBuilder().regarding(issue)

   let reopen = message.actionRegistry().findByName("ReopenIssue|Reopen")
   reopen = message.actionRegistry().bindParameter(reopen, "number", issue.number())
   reopen = message.actionRegistry().bindParameter(reopen, "repo", issue.repo().name())
   reopen = message.actionRegistry().bindParameter(reopen, "owner", issue.repo().owner())
   message.withAction(reopen)

   message.send()
})

atomist.on<TreeNode, TreeNode>("/comment", m => {
   let issueComment = m.root() as any
   let message = atomist.messageBuilder().regarding(issueComment)

   let assign = message.actionRegistry().findByName("AssignIssue|Assign")
   assign = message.actionRegistry().bindParameter(assign, "number", issueComment.on().number())
   assign = message.actionRegistry().bindParameter(assign, "repo", issueComment.repo().name())
   assign = message.actionRegistry().bindParameter(assign, "owner", issueComment.repo().owner())
   message.withAction(assign)

   let bug = message.actionRegistry().findByName("LabelIssue|Label as Bug")
   bug = message.actionRegistry().bindParameter(bug, "number", issueComment.on().number())
   bug = message.actionRegistry().bindParameter(bug, "label", "bug")
   bug = message.actionRegistry().bindParameter(bug, "repo", issueComment.repo().name())
   bug = message.actionRegistry().bindParameter(bug, "owner", issueComment.repo().owner())
   message.withAction(bug)

   let enhancement = message.actionRegistry().findByName("LabelIssue|Label as Enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "number", issueComment.on().number())
   enhancement = message.actionRegistry().bindParameter(enhancement, "label", "enhancement")
   enhancement = message.actionRegistry().bindParameter(enhancement, "repo", issueComment.repo().name())
   enhancement = message.actionRegistry().bindParameter(enhancement, "owner", issueComment.repo().owner())
   message.withAction(enhancement)

   let close = message.actionRegistry().findByName("CloseIssue|Close")
   close = message.actionRegistry().bindParameter(close, "number", issueComment.on().number())
   close = message.actionRegistry().bindParameter(close, "repo", issueComment.repo().name())
   close = message.actionRegistry().bindParameter(close, "owner", issueComment.repo().owner())
   message.withAction(close)

   let comment = message.actionRegistry().findByName("CommentIssue|Comment")
   comment = message.actionRegistry().bindParameter(comment, "number", issueComment.on().number())
   comment = message.actionRegistry().bindParameter(comment, "repo", issueComment.repo().name())
   comment = message.actionRegistry().bindParameter(comment, "owner", issueComment.repo().owner())
   message.withAction(comment)

   message.send()
})
