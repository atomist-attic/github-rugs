import "mocha";
import * as assert from "power-assert";
import { IssueCommit, renderCommit } from "../handlers/command/issue/ListIssues";

describe("Handle rendering of issue commits", () => {

    it("should render issue commits", () => {
        const url = "https://github.com/atomist/github-rugs/git/commits/589c6872faf70a350ac9f73a584b19bd78f8ccab";
        const issueCommit: IssueCommit = {
            sha: "589c6872faf70a350ac9f73a584b19bd78f8ccab",
            htmlUrl: url,
            message: "This is a test #1",
        };
        const expected = "`<" + url + "|589c687>` This is a test #1";
        assert(renderCommit(issueCommit) === expected);
    });
});
