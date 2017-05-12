/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Push } from "@atomist/cortex/Push";
import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { EventPlan, HandleEvent, LifecycleMessage } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";

@EventHandler("GitHubPushes", "Handle push events",
    new PathExpression<Push, Push>(
        `/Push()
            [/repo::Repo()/channels::ChatChannel()]
            [/after::Commit()]
            [/commits::Commit()/author::GitHubId()
                [/person::Person()/chatId::ChatId()]?]`))
@Tags("github", "push")
class NewPush implements HandleEvent<Push, Push> {
    public handle(event: Match<Push, Push>): EventPlan {
        const push = event.root;
        const cid = "commit_event/" + push.repo.owner + "/" + push.repo.name + "/" + push.after.sha;
        const message = new LifecycleMessage(push, cid);
        return EventPlan.ofMessage(message);
    }
}
export const push = new NewPush();
