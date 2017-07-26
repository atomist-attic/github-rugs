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

import { handleErrors, wrap } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

import {
    Action,
    Attachment,
    emptyString,
    escape,
    render,
    rugButtonFrom,
    url,
} from "@atomist/slack-messages/SlackMessages";

import {
    renderError,
} from "@atomist/slack-messages/RugMessages";

import {
    CommandHandler,
    Intent,
    MappedParameter,
    Parameter,
    ParseJson,
    ResponseHandler,
    Secrets,
    Tags,
} from "@atomist/rug/operations/Decorators";

import {
    ChannelAddress,
    CommandPlan,
    HandleCommand,
    HandlerContext,
    HandleResponse,
    MappedParameters,
    MessageMimeTypes,
    Presentable,
    Response,
    ResponseMessage,
    UpdatableMessage,
} from "@atomist/rug/operations/Handlers";

@CommandHandler("ListGitHubIssues", "List user's GitHub issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("list issues")
class ListIssuesCommand implements HandleCommand {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    public days: number = 1;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

    @MappedParameter(MappedParameters.SLACK_USER)
    public requester: string;

    @MappedParameter(MappedParameters.SLACK_CHANNEL_NAME)
    public channel: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const exec = execute("list-github-user-issues", this);
        exec.onSuccess = {
            kind: "respond", name: "DisplayGitHubIssues",
            parameters: {
                days: this.days, apiUrl: this.apiUrl, showActions: 0, requester: this.requester,
                channel: this.channel,
            },
        };
        plan.add(handleErrors(exec, this));
        return plan;
    }
}

@CommandHandler("ListGitHubRepositoryIssues", "List a GitHub repo's issues")
@Tags("github", "issues")
@Secrets("github://user_token?scopes=repo")
@Intent("search issues", "open issues")
class ListRepositoryIssuesCommand implements HandleCommand {

    @Parameter({ description: "Issue search term", pattern: "^.*$", required: false })
    public q: string = "";

    @Parameter({ description: "Results per page", pattern: "^[0-9]*$", required: false })
    public perPage: number = 5;

    @Parameter({ description: "Results page", pattern: "^[0-9]*$", required: false })
    public page: number = 1;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

    @MappedParameter(MappedParameters.SLACK_USER)
    public requester: string;

    @MappedParameter(MappedParameters.SLACK_CHANNEL_NAME)
    public channel: string;

    public handle(ctx: HandlerContext): CommandPlan {
        // Bot sends null for search if it is no specified
        if (!this.q) {
            this.q = "";
        }

        const plan = new CommandPlan();

        plan.add({
            instruction: {
                kind: "execute",
                name: "search-github-issues",
                parameters: this,
            },
            onSuccess: {
                kind: "respond",
                name: "DisplayGitHubIssues",
                parameters: this,
            },
            onError: {
                kind: "respond",
                name: "GenericErrorHandler",
                parameters: {
                    msg: "Failed to list issues: ",
                },
            },
        });
        return plan;
    }
}

interface GitHubUser {
    html_url: string;
    login: string;
    avatar_url: string;
}

interface GitHubIssue {
    number: string;
    title: string;
    state: string;
    assignee: GitHubUser;
    issueUrl: string;
    url: string;
    repo: string;
    ts: number;
}

function renderIssues(issues: GitHubIssue[], apiUrl: string, showActions: number, q: string, page: number,
                      perPage: number, requestor: string, channel: string):
    UpdatableMessage | ResponseMessage {
    try {
        const instructions: Array<Presentable<"command">> = [];
        const attachments = issues.map((issue, idx) => {
            const issueTitle = `#${issue.number}: ${issue.title}`;
            const attachment: Attachment = {
                fallback: escape(issueTitle),
                mrkdwn_in: ["text"],
                text: `${url(issue.issueUrl, issueTitle)}`,
                footer: `${url(issue.url, issue.repo)}`,
                ts: issue.ts,
            };
            if (issue.assignee !== undefined) {
                attachment.author_link = issue.assignee.html_url;
                attachment.author_name = `@${issue.assignee.login}`;
                attachment.author_icon = issue.assignee.avatar_url;
            }
            if (issue.state === "closed") {
                attachment.footer_icon = "http://images.atomist.com/rug/issue-closed.png";
                attachment.color = "#bd2c00";
            } else {
                attachment.footer_icon = "http://images.atomist.com/rug/issue-open.png";
                attachment.color = "#6cc644";
            }
            attachment.actions = [];
            if (showActions.toString() === "1") {
                createActions(issue, apiUrl).forEach(a => {
                    const [instruction, action] = a;
                    attachment.actions.push(action);
                    instructions.push(instruction);
                });
            }
            return attachment;
        });

        // Add paging actions into Message
        if (showActions.toString() === "1") {

            const pagingAttachment: Attachment = {
                fallback: "Paging",
                actions: [],
            };

            // Back
            if (page > 1) {
                const nextInstr: any = {
                    id: `back-issue-search`,
                    instruction: {
                        kind: "command",
                        name: "ListGitHubRepositoryIssues",
                        parameters: {
                            q,
                            page: Math.floor(+page - 1),
                            perPage,
                        },
                    },
                };
                pagingAttachment.actions.push(rugButtonFrom({ text: ":arrow_backward: Back" }, nextInstr));
                instructions.push(nextInstr);
            }
            // Next
            // Tripple equals won't work
            // tslint:disable-next-line:triple-equals
            if (issues.length == perPage) {
                console.log("testing2");
                const nextInstr: any = {
                    id: `next-issue-search`,
                    instruction: {
                        kind: "command",
                        name: "ListGitHubRepositoryIssues",
                        parameters: {
                            q,
                            page: Math.floor(+page + 1),
                            perPage,
                        },
                    },
                };
                pagingAttachment.actions.push(rugButtonFrom({ text: "Next :arrow_forward:" }, nextInstr));
                instructions.push(nextInstr);
            }
            // Triple equals won't work!!!
            // tslint:disable-next-line:triple-equals
            if (issues.length == perPage || page > 1) {
                attachments.push(pagingAttachment);
            }
        }

        const msg = render({ attachments }, true);
        let responseMsg;
        if (q == null || q.length === 0) {
            responseMsg = new ResponseMessage(msg, MessageMimeTypes.SLACK_JSON);
        } else {
            responseMsg = new UpdatableMessage(`issue_search/${requestor}/${encodeURI(q)}`, msg,
                new ChannelAddress(channel), MessageMimeTypes.SLACK_JSON);
            responseMsg.ttl = (new Date().getTime() + (1000 * 60 * 5)).toString();
        }
        instructions.forEach(i => responseMsg.addAction(i));
        return responseMsg;
    } catch (ex) {
        return renderError(`Error rendering issues ${ex}`, this.corrid);
    }
}

function createActions(issue: GitHubIssue, apiUrl: string):
    Array<[any, Action]> {
    const owner = issue.repo.split("/")[0];
    const repository = issue.repo.split("/")[1];
    const actions: Array<[any, Action]> = [];
    const assignInstr = {
        id: `assign-issue-${issue.number}`,
        instruction: {
            kind: "command",
            name: "AssignToMeGitHubIssue",
            parameters: {
                issue: issue.number,
                repo: repository,
                owner,
                apiUrl,
            },
        },
    };
    actions.push([assignInstr, rugButtonFrom({ text: "Assign to Me" }, assignInstr)]);

    const labelInstr = {
        id: `label-issue-${issue.number}`,
        instruction: {
            kind: "command",
            name: "AddLabelGitHubIssue",
            parameters: {
                issue: issue.number,
                repo: repository,
                owner,
                apiUrl,
            },
        },
    };
    actions.push([labelInstr, rugButtonFrom({ text: "Label" }, labelInstr)]);

    const closeInstr = {
        id: `close-issue-${issue.number}`,
        instruction: {
            kind: "command",
            name: "CloseGitHubIssue",
            parameters: {
                issue: issue.number,
                repo: repository,
                owner,
                apiUrl,
            },
        },
    };
    actions.push([closeInstr, rugButtonFrom({ text: "Close" }, closeInstr)]);

    const commentInstr = {
        id: `comment-issue-${issue.number}`,
        instruction: {
            kind: "command",
            name: "CommentGitHubIssue",
            parameters: {
                issue: issue.number,
                repo: repository,
                owner,
                apiUrl,
            },
        },
    };
    actions.push([commentInstr, rugButtonFrom({ text: "Comment" }, commentInstr)]);

    const reactInstr = {
        id: `react-issue-${issue.number}`,
        instruction: {
            kind: "command",
            name: "ReactGitHubIssue",
            parameters: {
                reaction: "+1",
                issue: issue.number,
                repo: repository,
                owner,
                apiUrl,
            },
        },
    };
    actions.push([reactInstr, rugButtonFrom({ text: ":+1:" }, reactInstr)]);

    return actions;
}

@ResponseHandler("DisplayGitHubIssues", "Formats GitHub issues list for display in slack")
class ListIssuesRender implements HandleResponse<GitHubIssue[]> {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    public days: number = 1;

    @Parameter({ description: "Issue search term", pattern: "^.*$", required: false })
    public q: string = "";

    @Parameter({ description: "Results per page", pattern: "^[0-9]*$", required: false })
    public perPage: number = 30;

    @Parameter({ description: "Issue search term", pattern: "^[0-9]*$", required: false })
    public page: number = 1;

    @Parameter({ description: "Show actions on issues", pattern: "^.*$" })
    public showActions: number = 1;

    @Parameter({ description: "GitHub api url", pattern: "^.*$" })
    public apiUrl: string = "https://api.github.com/";

    @Parameter({ description: "User requesting the search", pattern: "^.*$" })
    public requester: string;

    @Parameter({ description: "Channel the search is being run from", pattern: "^.*$" })
    public channel: string;

    public handle( @ParseJson response: Response<GitHubIssue[]>): CommandPlan {
        const issues = response.body;
        if (issues.length >= 1) {
            const plan = new CommandPlan();
            plan.add(renderIssues(issues, this.apiUrl, this.showActions, this.q, this.page, this.perPage,
                this.requester, this.channel));
            return plan;
        } else {
            if (this.showActions.toString() === "1") {
                return CommandPlan.ofMessage(new ResponseMessage(`No issues match your query \`${this.q}\``));
            } else {
                return CommandPlan.ofMessage(new ResponseMessage(`No issues found for the last ${this.days} day(s)`));
            }
        }
    }
}

const command = new ListIssuesCommand();
const listIssues = new ListIssuesRender();
const repo = new ListRepositoryIssuesCommand();

export { command, listIssues, repo };
