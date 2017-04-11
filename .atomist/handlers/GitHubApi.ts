import { Http } from "./HttpApi";

export class Repository {
    public readonly url = `https://api.github.com/repos/${this.owner}/${this.name}/`;
    public readonly headers = {
        "Content-Type": "application/json",
        "Authorization": `token ${this.token}`,
    };
    constructor(readonly owner: string, readonly name: string, readonly token: string) {}
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
