import "mocha";
import * as assert from "power-assert";
import { IssueCommit, renderCommit } from "../handlers/command/issue/ListIssues";

describe("Handle rendering of issue commits", () => {

    const url = "https://github.com/atomist/github-rugs/git/commits/589c6872faf70a350ac9f73a584b19bd78f8ccab";
    const sha = "589c6872faf70a350ac9f73a584b19bd78f8ccab";
    const tSha = "589c687";

    it("should render issue commits", () => {
        const issueCommit: IssueCommit = {
            sha,
            htmlUrl: url,
            message: "This is a test #1",
        };
        const expected = `<${url}|${tSha}> This is a test #1`;
        assert(renderCommit(issueCommit) === expected);
    });

    it("should properly truncate a commit message", () => {
        const issueCommit: IssueCommit = {
            sha,
            htmlUrl: url,
            message: `This is not a test #2 of the emergency broadcast system`,
        };
        const expected = `<${url}|${tSha}> This is not a test #2 of the emergency broadcast s...`;
        assert(renderCommit(issueCommit) === expected);
    });

    it("should only use the first line of the commit message", () => {
        const issueCommit: IssueCommit = {
            sha,
            htmlUrl: url,
            message: `This is a test #3

More info
But it shouldn't be shown.
`,
        };
        const expected = `<${url}|${tSha}> This is a test #3`;
        assert(renderCommit(issueCommit) === expected);
    });

});
