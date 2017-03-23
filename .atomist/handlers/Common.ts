import {HandleResponse, Response, HandlerContext, Message} from '@atomist/rug/operations/Handlers'
import {ResponseHandler, Parameter, Tags} from '@atomist/rug/operations/Decorators'
import {renderError, renderSuccess} from './SlackTemplates'

@ResponseHandler("generic-error-handler", "Displays an error in slack")
@Tags("errors")
class GenericErrorHandler implements HandleResponse<any> {
    
    @Parameter({description: "Error description", pattern: "@any"})
    msg: string

    handle(response: Response<any>): Message {
        return new Message(renderError(`${this.msg}${response.msg()}`));
    }
}
export let errorHandler = new GenericErrorHandler()

@ResponseHandler("generic-success-handler", "Displays a success message in slack")
@Tags("errors")
class GenericSuccessHandler implements HandleResponse<any> {

    @Parameter({description: "Success msg", pattern: "@any"})
    msg: string

    handle(response: Response<any>): Message {
        //TODO - render the body?
        return new Message(renderSuccess(`${this.msg}`));
    }
}
export let successHandler = new GenericSuccessHandler()