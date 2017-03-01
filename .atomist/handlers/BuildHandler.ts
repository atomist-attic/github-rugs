import {Atomist, MessageBuilder} from '@atomist/rug/operations/Handler'
import {TreeNode} from '@atomist/rug/tree/PathExpression'
declare var atomist: Atomist

// Handles builds triggered by a push
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

     // Attach restart action
     let restart = message.actionRegistry().findByName("RestartBuild")
     restart = message.actionRegistry().bindParameter(restart, "build_id", build.id())
     restart = message.actionRegistry().bindParameter(restart, "build_no", build.name())
     restart = message.actionRegistry().bindParameter(restart, "owner", build.on().owner())
     restart = message.actionRegistry().bindParameter(restart, "repo", build.on().name())
     message.withAction(restart)
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

// Handles builds triggered by a PR
atomist.on<TreeNode, TreeNode>(
   `/Build()
      [/on::Repo()/channel::ChatChannel()]
      [/triggeredBy::PullRequest()
        [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
        [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
        [/on::Repo()]]`, m => {

   let build = m.root() as any
   let mb = atomist.messageBuilder()
   let message = mb.regarding(build)
   let repo = "`" + build.on().owner() + "/" + build.on().name() + "`"
   let build_name = "`#" + build.name() + "`"

   if (build.status() == "Passed" || build.status() == "Fixed") {
     message.withAction(message.actionRegistry().findByName("CreateRelease|Release"))
   }
   else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
     let restart = message.actionRegistry().findByName("RestartBuild")
     restart = message.actionRegistry().bindParameter(restart, "build_id", build.id())
     restart = message.actionRegistry().bindParameter(restart, "build_no", build.name())
     restart = message.actionRegistry().bindParameter(restart, "owner", build.on().owner())
     restart = message.actionRegistry().bindParameter(restart, "repo", build.on().name())
     message.withAction(restart)
   }

   let cid = "pr_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.triggeredBy().number()
   message.withCorrelationId(cid).send()
})

