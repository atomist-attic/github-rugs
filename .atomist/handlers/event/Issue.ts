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

import { Comment } from "@atomist/cortex/Comment";
import { Issue } from "@atomist/cortex/Issue";

@EventHandler("OpenGitHubIssues", "Handle created issue events",
    new PathExpression<Issue, Issue>(
        `/Issue()[@state='open']
            [/resolvingCommits::Commit()/author::GitHubId()
                [/person::Person()/chatId::ChatId()]?]?
            [/openedBy::GitHubId()
                [/person::Person()/chatId::ChatId()]?]
            [/repo::Repo()/channels::ChatChannel()]
            [/labels::Label()]?`))
@Tags("github", "issue")
class OpenedIssue implements HandleEvent<Issue, Issue> {
    public handle(event: Match<Issue, Issue>): EventPlan {
        return new EventPlan();
    }
}
export const openedIssue = new OpenedIssue();

@EventHandler("ClosedGitHubIssues", "Handles closed issue events",
    new PathExpression<Issue, Issue>(
        `/Issue()[@state='closed']
            [/resolvingCommits::Commit()/author::GitHubId()
                [/person::Person()/chatId::ChatId()]?]?
            [/openedBy::GitHubId()
                [/person::Person()/chatId::ChatId()]?]
            [/closedBy::GitHubId()
                [/person::Person()/chatId::ChatId()]?]?
            [/repo::Repo()/channels::ChatChannel()]
            [/labels::Label()]?`))
@Tags("github", "issue")
class ClosedIssue implements HandleEvent<Issue, Issue> {
    public handle(event: Match<Issue, Issue>): EventPlan {
        return new EventPlan();
    }
}
export const closedIssue = new ClosedIssue();

@EventHandler("CommentedGitHubIssues", "Handles issue comments events",
    new PathExpression<Comment, Comment>(
        `/Comment()
            [/by::GitHubId()
                [/person::Person()/chatId::ChatId()]?]
            [/issue::Issue()
                [/repo::Repo()/channels::ChatChannel()]
                [/openedBy::GitHubId()[/person::Person()/chatId::ChatId()]?]
                [/resolvingCommits::Commit()/author::GitHubId()
                    [/person::Person()/chatId::ChatId()]?]?
                [/labels::Label()]?]`))
@Tags("github", "issue", "comment")
class CommentedIssue implements HandleEvent<Comment, Comment> {
    public handle(event: Match<Comment, Comment>): EventPlan {
        return new EventPlan();
    }
}
export const commentedIssue = new CommentedIssue();
