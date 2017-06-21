
import { CommandPlan, CommandRespondable, Execute, Respond } from "@atomist/rug/operations/Handlers";

const gh = "https://api.github.com";

export const TOKEN_PATH = "github://user_token?scopes=repo";

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/vnd.github.v3+json",
    "Authorization": `token #{${TOKEN_PATH}}`,
};

export function createIssue(owner: string, repo: string, title: string, body: string): Execute {
    return post(
        `repos/${owner}/issues/${repo}`, { title, body },
    );
}

export function closeIssue(owner: string, repo: string, issue: string): Execute {
    return patch(
        `repos/${owner}/issues/${repo}/${issue}`, { state: "closed" },
    );
}
/**
 * Do a GitHub API post, responding if necessary
 */
export function post(
    path: string,
    body: {}): Execute {
    return {
        kind: "execute",
        name: "http",
        parameters: {
            url: `${gh}/${path}`,
            method: "post",
            config: {
                headers,
                body: JSON.stringify(body),
            },
        },
    };
}
export function patch(
    path: string,
    body: {}): Execute {
    return {
        kind: "execute",
        name: "http",
        parameters: {
            url: `${gh}/${path}`,
            method: "patch",
            config: {
                headers,
                body: JSON.stringify(body),
            },
        },
    };
}
