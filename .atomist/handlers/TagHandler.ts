import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/tag", m => {
   let tag = m.root()
   atomist.messageBuilder().regarding(tag).send()
})
