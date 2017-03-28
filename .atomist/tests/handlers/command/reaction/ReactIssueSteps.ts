import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'

When("ReactIssue is invoked with valid input", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let handler = w.commandHandler("ReactGitHubIssue");
    w.invokeHandler(handler, {
      reaction: "+1",
      issueId: "1",
      repo: "testRepo",
      owner: "testOwner",
      corrid: "123"
    });
});

Then("respond with a single instruction", (world: HandlerScenarioWorld) => {
  let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
  return w.plan().instructions.length == 1;
});

Then("execute create reaction instruction", (world: HandlerScenarioWorld) => {
  let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
  let instruction = w.plan().instructions[0].instruction.detail
  return instruction.name == "react-github-issue"
});

Then("on success send a confirmation message", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let expected = "Successfully reacted with :+1: to testOwner/testRepo/issues/#1";
    let onSuccessMessage = w.plan().instructions[0].onSuccess.detail.parameters[0].value;
    return onSuccessMessage == expected;
});
