import {Atomist, MessageBuilder} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

atomist.on<TreeNode, TreeNode>("/build", m => {
   let build = m.root() as any
   let mb = atomist.messageBuilder()
   let message = mb.regarding(build)
   let repo = "`" + build.repo().owner() + "/" + build.repo().name() + "`"
   let commit = "`" + build.commit().sha() + "`"
   let build_name = "`#" + build.name() + "`"

   // TODO split this into two handlers with proper tree expressions with predicates
   if (build.status() == "Fixed") {
     sendDirectMessage(build, `Travis CI build ${build_name} of repo ${repo} is now fixed`, mb)
   }
   else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
     sendDirectMessage(build, `Travis CI build ${build_name} of repo ${repo} failed after your last commit ${commit}: ${build.build_url()}`, mb)
   }

   message.send()
})

function sendDirectMessage(build: any, message: string, mb: MessageBuilder) {
  if (build.commit().committer().person() != null) {
      mb.say(message).on(build.commit().committer().person().chatIdentity().chatId()).send()
  }
}
