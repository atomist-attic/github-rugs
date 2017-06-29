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

import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import { EventPlan, HandleEvent, LifecycleMessage } from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";

import { PullRequest } from "@atomist/cortex/PullRequest";

@EventHandler("OpenedGithubPullRequests", "Handle new pull-request events",
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='open']
            [/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/merger::GitHubId()[/person::Person()/chatId::ChatId()]?]?
            [/commits::Commit()/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/builds::Build()/repo::Repo()]?
            [/repo::Repo()/channels::ChatChannel()]`))
@Tags("github", "pr", "pull request")
class OpenedPullRequest implements HandleEvent<PullRequest, PullRequest> {
    public handle(event: Match<PullRequest, PullRequest>): EventPlan {
        return new EventPlan();
    }
}
export const openedPullRequest = new OpenedPullRequest();

@EventHandler("ClosedGitHubPullRequests", "Handle closed pull-request events",
    new PathExpression<PullRequest, PullRequest>(
        `/PullRequest()[@state='closed']
            [/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/merger::GitHubId()[/person::Person()/chatId::ChatId()]?]?
            [/commits::Commit()/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
            [/builds::Build()/repo::Repo()]?
            [/repo::Repo()/channels::ChatChannel()]`))
@Tags("github", "pr", "pull reuqest")
class ClosedPullRequest implements HandleEvent<PullRequest, PullRequest> {
    public handle(event: Match<PullRequest, PullRequest>): EventPlan {
        return new EventPlan();
    }
}
export const closedPullRequest = new ClosedPullRequest();
