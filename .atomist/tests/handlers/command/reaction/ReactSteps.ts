import { Given, When, Then, HandlerScenarioWorld, CommandHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { HandleResponse, Execute, Respondable, HandleCommand, MappedParameters, Respond, Instruction, Response, HandlerContext, Plan, Message } from '@atomist/rug/operations/Handlers'

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) is invoked with valid input", (world: HandlerScenarioWorld, handlerName: string, reactableType: string, id: string) => {
    let parameters = {}
    parameters[reactableType] = id
    invokeReactHandler(world, handlerName, parameters)
});

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) comment is invoked with valid input", (world: HandlerScenarioWorld, handlerName: string, reactableType: string, id: string) => {
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
    let parameters = { ...commonParameters, ...specificParameters }
    let handler = w.commandHandler(handlerName);
    w.invokeHandler(handler, parameters);
}

Then("respond with a single instruction", (world: HandlerScenarioWorld) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    return w.plan().instructions.length == 1;
});

Then("execute ([a-z\\-]+) instruction", (world: HandlerScenarioWorld, expectedInstructionName: string) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const name = instruction.name as string;
    return name == expectedInstructionName
});

Then("execute http instruction", (world: HandlerScenarioWorld) => {
    const w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const http = instruction.parameters;
    return instruction.name == "http" && http["method"] == "POST" && http["url"] == "/repos/testOwner/testRepo/issues/1/reactions"
});

Then("on success send '(.+)'", (world: HandlerScenarioWorld, expectedSuccessMessage: string) => {
    let w: CommandHandlerScenarioWorld = world as CommandHandlerScenarioWorld;
    const respondable = w.plan().instructions[0] as Respondable<Execute>;
    const onSuccessMessage = respondable.onSuccess as any;
    const successMessage = onSuccessMessage.parameters.msg;
    return successMessage == expectedSuccessMessage;
});
