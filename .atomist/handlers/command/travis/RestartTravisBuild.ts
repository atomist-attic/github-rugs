import {HandleResponse, Execute, Respondable, MappedParameters, HandleCommand, Respond, Response, HandlerContext, Plan, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, ParseJson, CommandHandler, Secrets, MappedParameter, Parameter, Tags, Intent} from '@atomist/rug/operations/Decorators'
import { Issue } from "@atomist/github/core/Core"
import * as slack from '../../SlackTemplates'

@CommandHandler("RestartTravisBuild", "Restart a Travis CI build")
@Tags("travis", "ci")
@Secrets("github://user_token?scopes=repo")
@Intent("restart build")
class RestartBuild implements HandleCommand {
    
    @Parameter({description: "The Travis CI build ID", pattern: "^.*$"})
    buildId: number

    @Parameter({description: ".org or .com", pattern: "^\.com|\.org$"})
    org: string = ".org"

    handle(ctx: HandlerContext): Plan {
        let plan = new Plan();
        let execute: Respondable<Execute> = 
        {instruction:
          {kind: "execute", name: "restart-travis-build", parameters: this}}
        plan.add(execute)
        return plan;
    }
}

export const restarter = new RestartBuild();