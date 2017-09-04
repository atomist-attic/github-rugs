import "mocha";
import assert = require("power-assert");

import { Response, Status } from "@atomist/rug/operations/Handlers";
import { WebHookErrorHandler } from "../handlers/command/InstallWebHooks";

describe("Handle webhook installation errors", () => {

    const handler = new WebHookErrorHandler();
    const anyHandler = handler as any;
    anyHandler.repo = "github-rugs";
    anyHandler.url = "http://github.com";
    anyHandler.owner = "atomist";

    it("should return an error if the webhook is already installed", () => {
        const response: Response<any> = {
            body: {
                errors: [{
                    message: "Hook already exists on this organization",
                }],
            },
            msg: "",
            code: 0,
            status: Status.failure,
        };
        const plan = handler.handle(response);
        assert(
            (plan.messages[0] as any).body.indexOf("Webhook already installed for atomist (http://github.com)") !== -1);
    });
    it("should return a more generic error if there are not specific errors", () => {
        const response: Response<any> = {
            body: {
                message: "Not found",
            },
            msg: "failed",
            code: 404,
            status: Status.failure,
        };
        const plan = handler.handle(response);
        assert(
            (plan.messages[0] as any).body.indexOf("Failed to install webhook: Not found (404)") !== -1);
    });
});
