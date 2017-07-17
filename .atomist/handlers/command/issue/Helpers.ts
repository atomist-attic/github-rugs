import * as cortex from "@atomist/cortex/Types";
import { PathExpressionEngine } from "@atomist/rug/tree/PathExpression";

const PATTERNS = [
    /<@(U[0-9A-Z]*)>/g,
];

export function replaceChatIdWithGitHubId(body: string, pe: PathExpressionEngine, root: cortex.ChatTeam): string {
    const matches = getChatIds(body);
    if (matches != null) {
        matches.forEach(m => {
            const gitHubId = loadGitHubId(m, pe, root);
            if (gitHubId != null) {
                body = body.split(`<@${m}>`).join(`@${gitHubId.login}`);
            }
        });
    }
    return body;
}

function loadGitHubId(id: string, pe: PathExpressionEngine, root: cortex.ChatTeam): cortex.GitHubId {
    try {
        return pe.scalar<cortex.ChatTeam, cortex.GitHubId>(
            root, `/members::ChatId()[@id='${id}']/person::Person()/gitHubId::GitHubId()`);
    } catch (e) {
        console.log(`Unable to load GithubId for ${id}`);
    }
    return null;
}

function getChatIds(str: string): string[] {
    const matches = [];
    let match;
    PATTERNS.forEach(regex => {
        // tslint:disable-next-line:no-conditional-assignment
        while (match = regex.exec(str)) {
            matches.push(match[1]);
        }
    });

    return matches;
}
