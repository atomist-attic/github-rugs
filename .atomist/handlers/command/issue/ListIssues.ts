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

import { handleErrors } from "@atomist/rugs/operations/CommonHandlers";
import { execute } from "@atomist/rugs/operations/PlanUtils";

import {
    Action,
    Attachment, codeLine,
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
@Intent("my issues", "list issues")
class ListIssuesCommand implements HandleCommand {

    @Parameter({ description: "Number of days to search", pattern: "^.*$" })
    public days: number = 1;

    @MappedParameter("atomist://correlation_id")
    public corrid: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

    @MappedParameter(MappedParameters.SLACK_CHANNEL_NAME)
    public channel: string;

    public handle(ctx: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        const exec = execute("list-github-user-issues", this);
        exec.onSuccess = {
            kind: "respond", name: "DisplayGitHubIssues",
            parameters: {
                days: this.days, apiUrl: this.apiUrl, showActions: 0, channel: this.channel,
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
    public q: string = "is:open is:issue";

    @Parameter({ description: "Results per page", pattern: "^[0-9]*$", required: false })
    public perPage: number = 5;

    @Parameter({ description: "Results page", pattern: "^[0-9]*$", required: false })
    public page: number = 1;

    @Parameter({ description: "Search Id", pattern: "^[0-9]*$", required: false })
    public id: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    public repo: string;

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    @MappedParameter("atomist://github_api_url")
    public apiUrl: string = "https://api.github.com/";

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

export interface GitHubUser {
    html_url: string;
    login: string;
    avatar_url: string;
}

export interface GitHubIssue {
    number: string;
    title: string;
    state: string;
    assignee: GitHubUser;
    issueUrl: string;
    url: string;
    repo: string;
    ts: number;
    commits: IssueCommit[];
}

export interface IssueCommit {
    sha: string;
    htmlUrl: string;
    message: string;
}

export function renderCommit(c: IssueCommit): string {
    const sha = c.sha.slice(0, 7);
    const title = c.message.split("\n")[0];
    const shortTitle = (title.length > 50) ? title.slice(0, 50) + "..." : title;
    return `URL: '${c.htmlUrl}', SHA: '${sha}: ${shortTitle}`;
}

// if q is nonempty and showActions is 1, you'll get an UpdatableMessage with paging actions
// apiUrl, page, perPage, channel, owner, repo, and id are only used for these
//
// if you want actions on the issue(s) but not paging actions, then pass in:
// showActions = 1, page = 1, perPage > issues.length
export function renderIssues(
    issues: GitHubIssue[], apiUrl: string, showActions: number, q: string, page: number,
    perPage: number, channel: string, owner: string, repo: string, id: string,
): UpdatableMessage | ResponseMessage {

    try {
        const instructions: Array<Presentable<"command">> = [];
        const attachments = issues.map((issue, ix) => {
            const issueTitle = `#${issue.number}: ${issue.title}`;
            let text = `${url(issue.issueUrl, issueTitle)}`;
            issue.commits.forEach(c => {
                text += `\n${renderCommit(c)}`;
            });

            const attachment: Attachment = {
                fallback: escape(issueTitle),
                mrkdwn_in: ["text"],
                text,
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
                footer: `Search: ${q}`,
                ts: Math.floor(new Date().getTime() / 1000),
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
                            repo,
                            owner,
                            id,
                        },
                    },
                };
                pagingAttachment.actions.push(rugButtonFrom({ text: "Back" }, nextInstr));
                instructions.push(nextInstr);
            }
            // Next
            // Tripple equals won't work
            // tslint:disable-next-line:triple-equals
            if (issues.length == perPage) {
                const nextInstr: any = {
                    id: `next-issue-search`,
                    instruction: {
                        kind: "command",
                        name: "ListGitHubRepositoryIssues",
                        parameters: {
                            q,
                            page: Math.floor(+page + 1),
                            perPage,
                            repo,
                            owner,
                            id,
                        },
                    },
                };
                pagingAttachment.actions.push(rugButtonFrom({ text: "Next" }, nextInstr));
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
            responseMsg = new UpdatableMessage(`issue_search/${id}/${encodeURI(q)}`, msg,
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

    if (issue.state === "open") {
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

    } else if (issue.state === "closed") {
        const reopenInstr = {
            id: `reopen-issue-${issue.number}`,
            instruction: {
                kind: "command",
                name: "ReopenGitHubIssue",
                parameters: {
                    issue: issue.number,
                    repo: repository,
                    owner,
                    apiUrl,
                },
            },
        };
        actions.push([reopenInstr, rugButtonFrom({ text: "Reopen" }, reopenInstr)]);
    }

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

    @Parameter({ description: "Channel the search is being run from", pattern: "^.*$" })
    public channel: string;

    @Parameter({ description: "Repo", pattern: "^.*$", required: false })
    public repo: string;

    @Parameter({ description: "Owner", pattern: "^.*$", required: false })
    public owner: string;

    @Parameter({ description: "Id", pattern: "^.*$", required: false })
    public id: string;

    public handle( @ParseJson response: Response<GitHubIssue[]>): CommandPlan {
        if (this.id == null) {
            this.id = new Date().getTime().toString();
        }

        const issues = response.body;
        if (issues.length >= 1) {
            const plan = new CommandPlan();
            plan.add(renderIssues(issues, this.apiUrl, this.showActions, this.q, this.page, this.perPage,
                this.channel, this.owner, this.repo, this.id));
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

export const issueCommand = new ListIssuesCommand();
export const listIssues = new ListIssuesRender();
export const repoCommand = new ListRepositoryIssuesCommand();
