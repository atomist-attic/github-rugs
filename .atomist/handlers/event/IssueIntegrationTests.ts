import { IntegrationTest, MappedParameter, Secrets } from "@atomist/rug/operations/Decorators";
import { HandlerContext, MappedParameters, Response } from "@atomist/rug/operations/Handlers";
import * as github from "../utils/GitHub";
import * as slack from "../utils/Slack";

import {
    ChainedInstruction,
    HandlerChain,
    HandlerChainDescriptor,
    ResponseChainingCommandHandler,
} from "@atomist/rugs/operations/HandlerChains";

/**
 * Test that an issue is rendered in a Slack channel when created on
 * GitHub
 *
 * 1. Asserting that a repo exists
 * 2. Ensuring it is associated with a slack channel
 * 3. Creating an issue in it
 * 4. Confirming that the lifecycle message is rendered in the channel
 *
 * Needs 'repo' scoped token to create repo
 */

const testFlow: HandlerChainDescriptor = {
    handle: createRepo,
    onAny: {
        handle: assocRepo,
        onSuccess: {
            handle: createIssue,
            onSuccess: {
                handle: assertIssueCreated,
                onSuccess: {
                    handle: closeIssue,
                    onSuccess: {
                        handle: assertIssueClosed,
                        onSuccess: {
                            handle: notifySuccess,
                        },
                    },
                },
            },
        },
    },
};

@IntegrationTest("Test that an issue is rendered in a Slack channel when created on GitHub")
@Secrets(github.TOKEN_PATH, slack.TOKEN_PATH)
class IssueRenderedTest extends ResponseChainingCommandHandler {

    @MappedParameter(MappedParameters.GITHUB_REPO_OWNER)
    public owner: string;

    public init(ctx: HandlerContext): ChainedInstruction {
        return new ChainedInstruction(slack.listUsers(), { owner: this.owner });
    }
}

export const handlers =
    new IssueRenderedTest(testFlow)
        .buildHandlerChain();

// start: response handler logic functions

/**
 * Extract slack user Id from response and create repo
 */
function createRepo(response: Response<any>, params: any): ChainedInstruction {
    if (response.code !== 200) {
        throw new Error(`List users failed with ${response.code}`);
    }
    const body = JSON.parse(response.body);

    if (body.ok !== true) {
        throw new Error(`Could not retrieve user list: ${body.error}`);
    }
    const members: any[] = body.members;
    const found: any[] = members.filter(m => {
        return m.name === "atomist" && m.is_bot === true;
    });
    if (found.length !== 1) {
        throw new Error("Could not find atomist bot. Matches: " + found.length);
    }
    return new ChainedInstruction(
        github.post(
            `/orgs/${this.owner}/repos`,
            { name: "issues" }),
        { owner: params.owner, slackId: found.pop().id });
}
function handleErrors(response: Response<any>, params: any): ChainedInstruction {
    const msg =
        // tslint:disable-next-line:max-line-length
        `Error during test run: code=${response.code}, msg=${response.msg}, status=${JSON.stringify(response.status)}, body=${JSON.stringify(response.body)}`;
    return new ChainedInstruction(
        slack.postMessage(msg, "general", "CLI"),
        params,
    );
}

function notifySuccess(response: Response<any>, params: any): ChainedInstruction {
    return new ChainedInstruction(
        slack.postMessage("End to end test complete :boom:", "general", "CLI"),
        params,
    );
}
/**
 * Called after create repo success and failure.
 * Then associate this repo with general channel
 */
function assocRepo(response: Response<any>, params: any): ChainedInstruction {
    if (response.code === 422 || response.code === 201) {
        return new ChainedInstruction(
            slack.converse(
                `<@${params.slackId}> repo issues`,
                "general",
                "atomist",
                "CLI",
                "I will make sure there is a relationship between channel #general and repo issues",
                30,
            ), params);
    } else {
        throw Error(`Not sure how to handle response: ${response.code} -> ${response.msg}`);
    }
}
/**
 * Create an issue
 */
function createIssue(response: Response<any>, params: any): ChainedInstruction {
    const now = new Date().toISOString();
    params.now = now;
    return new ChainedInstruction(
        github.createIssue(params.owner, "issues", "Test title", `Created at: ${now}`),
        params,
    );
}

/**
 * Called after create repo success and failure.
 * Then associate this repo with general channel
 */
const issNumberRegEx = /^.*\/(\d+)::.*$/g;
function closeIssue(response: Response<any>, params: any): ChainedInstruction {
    const body = JSON.parse(response.body);

    // tslint:disable-next-line:no-string-literal
    const cid = body.attachments[0]["callback_id"];
    return new ChainedInstruction(
        github.closeIssue(params.owner, "issues", issNumberRegEx.exec(cid).pop()),
        params,
    );
}

/**
 * Wait for notification that the issue is closed
 */
function assertIssueClosed(response: Response<any>, params: any): ChainedInstruction {
    return new ChainedInstruction(
        slack.converse(
            "Waiting for issue to close...",
            "general",
            "atomist",
            "CLI",
            `.*closed issue.*`,
            30,
        ), params);
}

function assertIssueCreated(response: Response<any>, params: any): ChainedInstruction {
    return new ChainedInstruction(
        slack.converse(
            "Waiting for issue to be created...",
            "general",
            "atomist",
            "CLI",
            `Created at: ${params.now}`,
            30,
        ), params);
}
