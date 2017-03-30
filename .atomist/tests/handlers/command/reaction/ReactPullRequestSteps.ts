import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'

When("ReactPullRequest is invoked with valid input", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let handler = w.commandHandler("ReactGitHubPullRequest");
    w.invokeHandler(handler, {
      reaction: "+1",
      pullRequest: "2",
      repo: "testRepo",
      owner: "testOwner",
      corrid: "123"
    });
});

Then("on success send a react-github-pull-request confirmation message", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let expected = "Successfully reacted with :+1: to testOwner/testRepo/pulls/#2";
    let onSuccessMessage = w.plan().instructions[0].onSuccess.detail.parameters[0].value;
    return onSuccessMessage == expected;
});
