import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { HandleEvent, DirectedMessage, Plan, ChannelAddress } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";
import { Project } from "@atomist/rug/model/Project";

import { Push } from "@atomist/cortex/Push";

@EventHandler("GithubPushAS", "Handle push events into artifact source",
    new PathExpression<Push, Push>(
        `/Push()
            [/repo::Repo()
              [/master::Project()/File()[@name='notfound.md']]
              [/channels::ChatChannel()]]`))
@Tags("github", "push")
class NewPushAS implements HandleEvent<Push, Push> {
    handle(event: Match<Push, Push>): Plan {
        const push : Push = event.root();

        const repo: any = push.repo
        const project : Project = repo.PROJECT

        // these don't work
        //const files = project.fileCount
        //const readme = project.findFile("README.md").content

        const messageBody = "Found project: " + project + "with name:" + push.repo.name + " with children: " + project.children()
        const channel = new ChannelAddress("#flood")
        const message = new DirectedMessage(messageBody, channel, "text/plain")

        /*
        This is the message sent ->        

        ```{
  "coordinate" : "atomist:github-handlers:0.33.10:GithubPushAS",
  "payload" : "{\"corrid\":\"cefd4e2c-ad00-45a6-b531-f7a34ac074e5\",
                \"correlation_context\":{\"team\":{\"id\":\"T1L0VDKJP\"}},
                \"content_type\":\"text/plain\",
                \"message\":\"Found project: SafeCommittingProxy#789741125 around LinkableContainerTreeNode: (unresolvable,-dynamic);
                remainingPathExpression:[SimpleTerminalTreeNode(remainingPathExpression,NavigationAxis->master::NodesWithTag(Project)[]/Child::NodesWithTag(File)[@name=README.md],Set())]
                with name:handlers with children:
                [SafeCommittingProxy#1286078120 around SimpleTerminalTreeNode(remainingPathExpression,NavigationAxis->master::NodesWithTag(Project)[]/Child::NodesWithTag(File)[@name=README.md],Set())]\"
                ,\"channels\":[\"#flood\"]}",
  "event-type" : "message",
  "correlation-id" : "cefd4e2c-ad00-45a6-b531-f7a34ac074e5",
  "name" : "GithubPushAS",
  "topic" : "command_handler_reponse",
  "type" : "event-handler"
}```
        */

        return Plan.ofMessage(message);
    }
}
export const push = new NewPushAS();
