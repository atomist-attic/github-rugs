import { Given, When, Then, HandlerScenarioWorld, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core";
import { LifecycleMessage } from '@atomist/rug/operations/Handlers'
import { Issue } from "@atomist/cortex/stub/Issue";
import { GitHubId } from "@atomist/cortex/stub/GitHubId";
import { Repo } from "@atomist/cortex/stub/Repo";
import { ChatChannel } from "@atomist/cortex/stub/ChatChannel";

Given("the OpenedIssue Handler is registered", (world: HandlerScenarioWorld) => {
    let w: EventHandlerScenarioWorld = world as EventHandlerScenarioWorld;
    w.registerHandler("OpenGitHubIssues");
});

When("an OpenedIssue is received", (world: HandlerScenarioWorld) => {
    let w: EventHandlerScenarioWorld = world as EventHandlerScenarioWorld;
    let event: Issue = new Issue().withNumber(1).withState("open")
        .withOpenedBy(new GitHubId().withName("developer"))
        .withRepo(new Repo().withName("repo1").withOwner("owner1").addChannels(new ChatChannel().withName("repoX")));
    w.sendEvent(event);
});

Then("the event handler should have instructions", (world: HandlerScenarioWorld) => {
    let w: EventHandlerScenarioWorld = world as EventHandlerScenarioWorld;
    let message = w.plan().messages[0] as LifecycleMessage;
    return message.instructions.length == 5;
});
