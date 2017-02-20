import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/PullRequest()[/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?[/on::Repo()/channel::ChatChannel()][/head::Commit()/contains::Push()[/on::Repo()][/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]]", m => {
   let pr = m.root() as any

   if (pr.state() != "open") {
     return
   }

   let message = atomist.messageBuilder().regarding(pr)

   let merge = message.actionRegistry().findByName("MergePullRequest|Merge")
   merge = message.actionRegistry().bindParameter(merge, "number", pr.number())
   merge = message.actionRegistry().bindParameter(merge, "owner", pr.on().owner())
   merge = message.actionRegistry().bindParameter(merge, "repo", pr.on().name())
   message.withAction(merge)

   let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.head().sha()

   message.withCorrelationId(cid).send()
})

atomist.on<TreeNode, TreeNode>("/PullRequest()[/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?[/on::Repo()/channel::ChatChannel()][/head::Commit()/contains::Push()[/on::Repo()][/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]]", m => {
   let pr = m.root() as any

   if (pr.state() != "closed") {
     return
   }

   let message = atomist.messageBuilder().regarding(pr)

   let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.head().sha()

   message.withCorrelationId(cid).send()
})
