import {HandleResponse, Response, HandlerContext, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, Parameter, Tags} from '@atomist/rug/operations/Decorators'

@ResponseHandler("GenericErrorHandler", "Displays an error in slack")
@Tags("errors")
class GenericErrorHandler implements HandleResponse<any> {

   @Parameter({description: "Error description", pattern: "@any"})
   msg: string

    handle(response: Response<any>): Message {
        return new Message(`${this.msg}${response.msg()}`);
    }
}
export let errorHandler = new GenericErrorHandler()