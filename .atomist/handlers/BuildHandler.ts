import {Atomist, MessageBuilder} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/Build[/hasBuild::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/on::Repo()/channel::ChatChannel()][/triggeredBy::Push()[/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?][/on::Repo()]]", m => {
   let build = m.root() as any
   let mb = atomist.messageBuilder()
   let message = mb.regarding(build)
   let repo = "`" + build.on().owner() + "/" + build.on().name() + "`"
   let commit = "`" + build.hasBuild().sha() + "`"
   let build_name = "`#" + build.name() + "`"

   // TODO split this into two handlers with proper tree expressions with predicates
   if (build.status() == "Passed" || build.status() == "Fixed") {
     //message.withAction(message.actionRegistry().findByName("CreateRelease|Release"))
     if (build.status() == "Fixed") {
       sendDirectMessage(build, `Travis CI build ${build_name} of repo ${repo} is now fixed`, mb)
     }
   }
   else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
     sendDirectMessage(build, `Travis CI build ${build_name} of repo ${repo} failed after your last commit ${commit}: ${build.build_url()}`, mb)
   }

   let cid = "commit_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.hasBuild().sha()
   message.withCorrelationId(cid).send()
})

function sendDirectMessage(build: any, message: string, mb: MessageBuilder) {
  /*
  if (build.hasBuild().author().hasGithubIdentity() != null) {
      mb.say(message).on(build.hasBuild().author().hasGitHubIdentity().hasChatIdentity().id()).send()
  }
  */
}
