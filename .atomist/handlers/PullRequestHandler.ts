import {Atomist} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>(
    `/PullRequest()
        [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
        [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
        [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
        [/triggeredBy::Build()/on::Repo()]?
        [/on::Repo()/channel::ChatChannel()]`, m => {

   let pr = m.root() as any
 
   // temp workaound to issue in path expressions looking up values on JsonBackedTreeNodes
   if (pr.state() != "open") {
     return
   }
 
   let message = atomist.messageBuilder().regarding(pr)
 
   let merge = message.actionRegistry().findByName("MergePullRequest|Merge")
   merge = message.actionRegistry().bindParameter(merge, "number", pr.number())
   message.withAction(merge)
 
   let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.number()
 
   message.withCorrelationId(cid).send()
})

atomist.on<TreeNode, TreeNode>(
    `/PullRequest()
        [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
        [/mergedBy::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]?
        [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
        [/triggeredBy::Build()/on::Repo()]?
        [/on::Repo()/channel::ChatChannel()]`, m => {

   let pr = m.root() as any

   // temp workaound to issue in path expressions looking up values on JsonBackedTreeNodes
   if (pr.state() != "closed") {
     return
   }

   let message = atomist.messageBuilder().regarding(pr)
   
   let cid = "pr_event/" + pr.on().owner() + "/" + pr.on().name() + "/" + pr.number()

   message.withCorrelationId(cid).send()
})
