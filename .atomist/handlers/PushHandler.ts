import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/Push()[/on::Repo()/channel::ChatChannel()][/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]", m => {
   let push = m.root() as any
   let cid = "commit_event/" + push.on().owner() + "/" + push.on().name() + "/" + push.after()

   let message = atomist.messageBuilder().regarding(push).withCorrelationId(cid).send()
})
