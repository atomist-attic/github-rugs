import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { HandleEvent, DirectedMessage, Plan, ChannelAddress } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";
import { Project } from "@atomist/rug/model/Project";

import { Push } from "@atomist/cortex/Push";

@EventHandler("GitHubPushes", "Handle push events",
    new PathExpression<Push, Push>(
        `/Push()
            [/repo::Repo()
              [/master::Project()]
              [/channels::ChatChannel()]]`))
@Tags("github", "push")
class NewPush implements HandleEvent<Push, Push> {
    handle(event: Match<Push, Push>): Plan {
        const push : Push = event.root();
        const repo: any = push.repo

        // not sure about this bit...
        const project : Project = repo.project
        const files = project.fileCount

        const messageBody = "Found " + files + " files in project: " + push.repo.name
        const channel = new ChannelAddress("#flood")
        const message = new DirectedMessage("", channel, "text/plain")

        return Plan.ofMessage(message);
    }
}
export const push = new NewPush();
