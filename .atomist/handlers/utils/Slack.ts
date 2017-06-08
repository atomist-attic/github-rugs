import { CommandPlan, CommandRespondable, Execute, Instruction, Respond } from "@atomist/rug/operations/Handlers";

const slack = "https://slack.com/api";

export const TOKEN_PATH = "secret://team?path=slack/legacy-token";

const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
};

/**
 * Do a GitHub API post, responding if necessary
 */

export function postMessage(
    text: string,
    channel: string,
    username: string): Execute {
    return post(
        "chat.postMessage",
        {
            channel,
            text,
            username,
        },
    );
}
export function post(
    method: string,
    params?: {}): Execute {

    if (params === undefined) {
        params = {};
    }
    return {
        kind: "execute",
        name: "http",
        parameters: {
            url: `${slack}/${method}`,
            method: "post",
            config: {
                headers,
                "form-params": {
                    token: `#{${TOKEN_PATH}}`,
                    ...params,
                },
            },
        },
    };
}

export function listUsers(): Execute {
    return post("users.list");
}

/**
 * Send message and wait for match
 */
export function converse(
    message: string,
    channel: string,
    fromUsername: string,
    asUsername: string,
    matching: string,
    timeoutSeconds: number): Execute {
    return {
        kind: "execute",
        name: "slack-converse",
        parameters: {
            message,
            channel,
            fromUsername,
            asUsername,
            matching,
            timeoutSeconds,
        },
    };
}
