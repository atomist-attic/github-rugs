import { Given, When, Then, HandlerScenarioWorld, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core";
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
    let event: Issue = new Issue().withState("open")
        .withBy(new GitHubId().withName("developer"))
        .withBelongsTo(new Repo().withName("repo1").withChannel([new ChatChannel().withName("repoX")]));
    w.sendEvent(event);
});

Then("the event handler should have instructions", (world: HandlerScenarioWorld) => {
    let w: EventHandlerScenarioWorld = world as EventHandlerScenarioWorld;
    let message = w.plan().messages[0];
    return message.instructions.length == 5;
});
