import * as cortex from "@atomist/cortex/stub/Types";
import {
    CommandHandler,
    Intent,
    MappedParameter,
    Parameter,
    ResponseHandler,
} from "@atomist/rug/operations/Decorators";
import {
    CommandPlan,
    CommandRespondable,
    Execute,
    HandleCommand,
    HandlerContext,
    HandleResponse,
    MappedParameters,
    Response,
    ResponseMessage,
} from "@atomist/rug/operations/Handlers";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import * as slack from "@atomist/slack-messages/SlackMessages";

/**
 * Figure out a browser link to the repo using the GitHub API link.
 *
 * @param webUrl URL of current GitHub provider
 * @param ownerName owner of repo
 * @param repoName name of repo
 * @return full repository URL
 */
function gitHubRepoUrl(webUrl: string, ownerName: string, repoName: string): string {
    if (webUrl && webUrl.slice(-1) === "/") {
        webUrl = webUrl.slice(0, -1);
    }
    const urlPattern: RegExp = /^(https?):\/\/([^\/]+)/;
    const matches = urlPattern.exec(webUrl);
    if (!matches || matches.length < 3) {
        throw new Error(`${webUrl} did not match ${urlPattern.source}`);
    }
    return `${webUrl}/${ownerName}/${repoName}`;
}

@CommandHandler(ReadFile.Name)
@Intent("show me a file")
class ReadFile implements HandleCommand {

    public static Name = "ReadFile";

    @MappedParameter(MappedParameters.GITHUB_API_URL)
    private apiUrl: string;

    @MappedParameter(MappedParameters.GITHUB_OWNER)
    private orgName: string;

    @MappedParameter(MappedParameters.GITHUB_REPOSITORY)
    private repoName: string;

    @MappedParameter(MappedParameters.CORRELATION_ID)
    private corrid: string;

    @Parameter({ pattern: Pattern.any })
    private path: string;

    @MappedParameter(MappedParameters.GITHUB_URL)
    private githubUrl: string;

    public handle(ctx: HandlerContext): CommandPlan {

        let defaultBranch = "master"; // usually works
        try {
            ctx.pathExpressionEngine.with(ctx.contextRoot as cortex.ChatTeam,
                "/org::Org()[@name=${this.orgName}]/repo::Repo()[@name=${this.repoName}]",
                r => defaultBranch = (r as any).defaultBranch);
        } catch (e) {
            console.log("Failed to fetch default branch"); // oh well
        }

        const readInstruction: CommandRespondable<Execute> = {
            instruction: {
                kind: "execute",
                name: "get-file-contents",
                parameters: {
                    path: this.path,
                    apiUrl: this.apiUrl,
                    repo: this.repoName,
                    owner: this.orgName,
                },
            },
            onSuccess: {
                kind: "respond",
                name: PrintFileContents.Name,
                parameters: {
                    corrid: this.corrid,
                    path: this.path,
                    repoName: this.repoName,
                    orgName: this.orgName,
                    githubUrl: this.githubUrl,
                    defaultBranch,
                },
            },
        };

        const plan = new CommandPlan();
        plan.add(readInstruction);

        return plan;
    }

}

@ResponseHandler(PrintFileContents.Name)
class PrintFileContents implements HandleResponse<string> {

    public static Name = "PrintFileContents";

    @MappedParameter(MappedParameters.CORRELATION_ID)
    private corrid: string;

    @Parameter({ pattern: Pattern.any })
    private repoName: string;

    @Parameter({ pattern: Pattern.any })
    private orgName: string;

    @Parameter({ pattern: Pattern.any })
    private githubUrl: string;

    @Parameter({ pattern: Pattern.any })
    private path: string;

    @Parameter({ pattern: Pattern.any })
    private defaultBranch: string;

    public handle(response: Response<string>, ctx?: HandlerContext): CommandPlan {
        const plan = new CommandPlan();
        if (response && response.body) {

            const repoUrl = gitHubRepoUrl(this.githubUrl, this.orgName, this.repoName);

            const msg = {
                text:
                    `${repoUrl}/blob/${this.defaultBranch}/${this.path}`,
                unfurl_links: false,
                unfurl_media: false,
                attachments: [
                    {
                        text: JSON.parse(response.body),
                        fallback: "the body of the file goes here",
                    },
                ],
            };

            plan.add(new ResponseMessage(slack.render(msg)));
        } else {
            plan.add(new ResponseMessage(`File ${this.path} not found in ${this.repoName}`));
        }
        return plan;
    }

}

export const readFile = new ReadFile();
export const readFileResponse = new PrintFileContents();
