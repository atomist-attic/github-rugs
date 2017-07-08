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

import { Http } from "./HttpApi";

export class Repository {
    public readonly url;
    public readonly headers = {
        "Content-Type": "application/json",
        "Authorization": `token ${this.token}`,
    };
    constructor(readonly owner: string, readonly name: string, readonly token: string,
                readonly apiUrl: string = "https://api.github.com") {
        this.url = `${apiUrl}/repos/${this.owner}/${this.name}/`;
    }
    public issue(id: number): Issue {
        return new Issue(this, id);
    }
    public issueComment(id: number): IssueComment {
        return new IssueComment(this, id);
    }
}

export abstract class Reactable {
    private readonly reactionHeaders = {
        Accept: "application/vnd.github.squirrel-girl-preview",
    };
    private readonly url = `${this.repo.url}${this.relativeUrl()}reactions`;
    private readonly headers = { ...this.repo.headers, ...this.reactionHeaders };

    constructor(readonly repo: Repository, readonly id: number) {}

    public react(reaction: Reaction): Http {
        return {
            url: `${this.url}`,
            method: "post",
            config: {
                body: JSON.stringify(reaction),
                headers: this.headers,
            },
        };
    }

    public reactions(): Http {
        return {
            url: `${this.url}`,
            method: "get",
            config: {
                headers: this.headers,
            },
        };
    }

    protected abstract relativeUrl(): string;
}

export class Issue extends Reactable {
    constructor(readonly repo: Repository, readonly id: number) { super(repo, id); }
    protected relativeUrl(): string { return `issues/${this.id}/`; }
}

export class IssueComment extends Reactable {
    constructor(readonly repo: Repository, readonly id: number) { super(repo, id); }
    protected relativeUrl(): string { return `issues/comments/${this.id}/`; }
}

export type ReactionContent = "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray";

export class Reaction {
    public content: ReactionContent;
}
