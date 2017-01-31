import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/pullRequest[.state()='open']", m => {
   let pr = m.root() as any
   let message = atomist.messageBuilder().regarding(pr)

   let merge = message.actionRegistry().findByName("MergePullRequest|Merge")
   merge = message.actionRegistry().bindParameter(merge, "number", pr.number())
   merge = message.actionRegistry().bindParameter(merge, "owner", pr.repo().owner())
   merge = message.actionRegistry().bindParameter(merge, "repo", pr.repo().name())
   message.withAction(merge)

   message.send()
})

atomist.on<TreeNode, TreeNode>("/pullRequest[.state()='closed']", m => {
   let pr = m.root() as any
   let message = atomist.messageBuilder().regarding(pr)
   message.send()
})
