import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { HandleEvent, LifecycleMessage, Plan } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";

import { Push } from "@atomist/cortex/Push";

@EventHandler("GitHubPushes", "Handle push events",
    new PathExpression<Push, Push>(
        `/Push()
            [/repo::Repo()/channels::ChatChannel()]
            [/commits::Commit()/author::GitHubId()
                [/person::Person()/chatId::ChatId()]?]`))
@Tags("github", "push")
class NewPush implements HandleEvent<Push, Push> {
    handle(event: Match<Push, Push>): Plan {
        const push = event.root();
        const cid = "commit_event/" + push.repo.owner + "/" + push.repo.name + "/" + push.after;

        const message = new LifecycleMessage(push, cid);

        return Plan.ofMessage(message);
    }
}
export const push = new NewPush();
