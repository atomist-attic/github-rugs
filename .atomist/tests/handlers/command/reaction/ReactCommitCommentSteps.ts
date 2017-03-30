import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'

When("ReactCommitComment is invoked with valid input", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let handler = w.commandHandler("ReactGitHubCommitComment");
    w.invokeHandler(handler, {
      reaction: "+1",
      sha1: "asdf",
      comment: "7",
      repo: "testRepo",
      owner: "testOwner",
      corrid: "123"
    });
});

Then("respond with a single instruction", (world: HandlerScenarioWorld) => {
  let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
  return w.plan().instructions.length == 1;
});

Then("execute ([a-z\\-]+) instruction", (world: HandlerScenarioWorld, chsw: String, instructionName: String) => {
  let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
  let instruction = w.plan().instructions[0].instruction.detail
  console.log(instruction.name + " == " + instructionName)
  return instruction.name == instructionName
});

Then("on success send a react-github-commit-comment confirmation message", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let expected = "Successfully reacted with :+1: to testOwner/testRepo/asdf/comments/7";
    let onSuccessMessage = w.plan().instructions[0].onSuccess.detail.parameters[0].value;
    return onSuccessMessage == expected;
});
