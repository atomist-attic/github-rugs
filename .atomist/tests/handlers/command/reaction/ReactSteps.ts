import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import {HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext , Plan, Message} from '@atomist/rug/operations/Handlers'

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) is invoked with valid input", (world: HandlerScenarioWorld, chsw, handlerName: string, reactableType: string, id: string) => {
    let parameters = {}
    parameters[reactableType] = id
    invokeReactHandler(world, handlerName, parameters)
});

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) comment is invoked with valid input", (world: HandlerScenarioWorld, chsw, handlerName: string, reactableType: string, id: string) => {
    let parameters = { comment: "7" }
    parameters[reactableType] = id
    invokeReactHandler(world, handlerName, parameters)
});

let invokeReactHandler = (world: HandlerScenarioWorld, handlerName: string, specificParameters) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let commonParameters = {
      reaction: "+1",
      repo: "testRepo",
      owner: "testOwner",
      corrid: "123"
    }
    let parameters = {...commonParameters, ...specificParameters}
    let handler = w.commandHandler(handlerName);
    w.invokeHandler(handler, parameters);
}

Then("respond with a single instruction", (world: HandlerScenarioWorld) => {
  let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
  return w.plan().instructions.length == 1;
});

Then("execute ([a-z\\-]+) instruction", (world: HandlerScenarioWorld, chsw: String, expectedInstructionName: string) => {
  let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
  let instruction = w.plan().instructions[0].instruction.detail
  return instruction.name == expectedInstructionName
});

Then("on success send '(.+)'", (world: HandlerScenarioWorld, chsw: String, expectedSuccessMessage: string) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    let onSuccessMessage = w.plan().instructions[0].onSuccess.detail.parameters[0].value;
    return onSuccessMessage == expectedSuccessMessage;
});
