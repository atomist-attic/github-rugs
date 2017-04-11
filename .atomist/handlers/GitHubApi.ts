export class Repository {
    constructor(readonly owner: string, readonly name: string) {}
    readonly url = `/repos/${this.owner}/${this.name}/`;
    issue(number: number): Issue {
        return new Issue(this, number)
    }
    issueComment(id: number): IssueComment {
        return new IssueComment(this, id)
    }
}

export abstract class Reactable {
    readonly url: string;
    readonly reactionsUrl = `${this.url}reactions`;
    readonly reactionHeader = {
        "Accept": "application/vnd.github.squirrel-girl-preview"
    }

    react(reaction: Reaction): Http {
        return {
            "url": `${this.url}reactions`,
            "method": "POST",
            "config": {
                "body": reaction,
                "headers": this.reactionHeader
            }
        }
    }

    reactions(): Http {
        return {
            "url": `${this.url}reactions`,
            "method": "GET",
            "config": {
                "headers": this.reactionHeader
            }
        }
    }
}

export class Issue extends Reactable {
    constructor(readonly repo: Repository, readonly number: number) { super() }
    readonly url = `${this.repo.url}issues/${this.number}/`;
}

export class IssueComment extends Reactable {
    constructor(readonly repo: Repository, readonly id: number) { super() }
    readonly url = `${this.repo.url}issues/comments/${this.id}/`;
}

export type ReactionContent = "+1" | "-1" | "laugh" | "confused" | "heart" | "hooray"

export class Reaction {
    content: ReactionContent
}

export type HttpMethod = "HEAD" | "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export class Http {
    readonly url: string;
    readonly method: HttpMethod;
    readonly config?: HttpConfig;
}

export class HttpConfig {
    readonly body?: Object;
    readonly headers?: Object;
}