import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { EventPlan, HandleEvent, LifecycleMessage } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";

import * as query from "@atomist/rugs/util/tree/QueryByExample";

import * as cortex from "@atomist/cortex/stub/Types";
// import { Commit, Status } from "@atomist/cortex/stub/Types";

/**
 * Auto-merge PRs if all of the below are true:
 *  1. There is a config file in the repo specifying the auto-merge policy
 *  2. The policy (e.g. number of LGTMs) is satisfied
 *  3. All 'statuses' are green
 *
 *  Triggered by:
 *  1. Status events on PR
 *
 *  For each, we make a request to GitHub to check the number of PR body
 *  thumbs-up/LTGMs _and_ that all statuses are true.
 *
 *  The response handler decides whether or not to merge based on that
 *  using HTTP function
 */

const status =
    new cortex.Status()
        .withState("success")
        .withCommit(new cortex.Commit()
            .withRepo(new cortex.Repo()));

console.log("########" + JSON.stringify(query.byExample(status)));

@EventHandler("AutoMergeOnStatusSuccess", "Handle new pull-request events", "/Status()")
@Tags("github", "pr", "pull request", "auto")
class AutoMergeOnStatusSuccess implements HandleEvent<cortex.Status, cortex.Status> {
    public handle(event: Match<cortex.Status, cortex.Status>): EventPlan {
        const st = event.root;

        // st.commit.repo.issue[0].comments[1].pullRequest;

        return new EventPlan();
    }
}
export const auto = new AutoMergeOnStatusSuccess();
