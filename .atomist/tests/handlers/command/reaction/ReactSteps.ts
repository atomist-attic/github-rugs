import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core";
import { HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response,
    HandlerContext, Plan } from "@atomist/rug/operations/Handlers";
import { Http } from "../../../../handlers/HttpApi";

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) is invoked with valid input",
  (world: HandlerScenarioWorld, handlerName: string, reactableType: string, id: string) => {
    const parameters = {};
    parameters[reactableType] = id;
    invokeReactHandler(world, handlerName, parameters);
});

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) comment is invoked with valid input",
  (world: HandlerScenarioWorld, handlerName: string, reactableType: string, id: string) => {
    const parameters = { comment: "7" };
    parameters[reactableType] = id;
    invokeReactHandler(world, handlerName, parameters);
});

const invokeReactHandler = (world: HandlerScenarioWorld, handlerName: string, specificParameters) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const commonParameters = {
        reaction: "+1",
        repo: "testRepo",
        owner: "testOwner",
        corrid: "123",
    };
    const parameters = { ...commonParameters, ...specificParameters };
    const handler = w.commandHandler(handlerName);
    w.invokeHandler(handler, parameters);
};

Then("respond with a single instruction", (world: HandlerScenarioWorld) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    return w.plan().instructions.length === 1;
});

Then("execute ([a-z\\-]+) instruction", (world: HandlerScenarioWorld, expectedInstructionName: string) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const name = instruction.name as string;
    return name === expectedInstructionName;
});

Then("execute http instruction", (world: HandlerScenarioWorld) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const http = instruction.parameters as Http;
    return instruction.name === "http" && http.method === "post" &&
      http.url === "https://api.github.com/repos/testOwner/testRepo/issues/1/reactions";
});

Then("on success send '(.+)'", (world: HandlerScenarioWorld, expectedSuccessMessage: string) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const onSuccessMessage = respondable.onSuccess as any;
    const successMessage = onSuccessMessage.parameters.msg;
    return successMessage === expectedSuccessMessage;
});
