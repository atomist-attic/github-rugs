/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { CommandRespondable, Execute } from "@atomist/rug/operations/Handlers";
import { CommandHandlerScenarioWorld, Given, Then, When } from "@atomist/rug/test/handler/Core";

import { Http } from "../../../../handlers/HttpApi";

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) is invoked with valid input",
    (world: CommandHandlerScenarioWorld, handlerName: string, reactableType: string, id: string) => {
        const parameters = {};
        parameters[reactableType] = id;
        invokeReactHandler(world, handlerName, parameters);
    });

When("([a-zA-Z]+) on ([a-zA-Z0-9]+) ([a-zA-Z0-9]+) comment is invoked with valid input",
    (world: CommandHandlerScenarioWorld, handlerName: string, reactableType: string, id: string) => {
        const parameters = { comment: "7" };
        parameters[reactableType] = id;
        invokeReactHandler(world, handlerName, parameters);
    });

const invokeReactHandler = (w: CommandHandlerScenarioWorld, handlerName: string, specificParameters) => {
    const commonParameters = {
        reaction: "+1",
        repo: "testRepo",
        owner: "testOwner",
        corrid: "123",
        apiUrl: "https://api.github.com",
    };
    const parameters = { ...commonParameters, ...specificParameters };
    const handler = w.commandHandler(handlerName);
    w.invokeHandler(handler, parameters);
};

Then("respond with a single instruction", (w: CommandHandlerScenarioWorld) => {
    return w.plan().instructions.length === 1;
});

Then("execute ([a-z\\-]+) instruction", (w: CommandHandlerScenarioWorld, expectedInstructionName: string) => {
    const respondable = w.plan().instructions[0] as CommandRespondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const name = instruction.name as string;
    return name === expectedInstructionName;
});

Then("execute http instruction", (w: CommandHandlerScenarioWorld) => {
    const respondable = w.plan().instructions[0] as CommandRespondable<Execute>;
    const instruction = respondable.instruction as Execute;
    const http = instruction.parameters as Http;
    return instruction.name === "http" && http.method === "post" &&
        http.url === "https://api.github.com/repos/testOwner/testRepo/issues/1/reactions";
});

Then("on success send '(.+)'", (w: CommandHandlerScenarioWorld, expectedSuccessMessage: string) => {
    const respondable = w.plan().instructions[0] as CommandRespondable<Execute>;
    const onSuccessMessage = respondable.onSuccess as any;
    const successMessage = onSuccessMessage.parameters.msg;
    return successMessage === expectedSuccessMessage;
});
