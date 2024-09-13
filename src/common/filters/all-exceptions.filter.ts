import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common"
import { HttpException } from "@nestjs/common/exceptions/http.exception"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name)

	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse()
		const status = exception.getStatus ? exception.getStatus() : 500

		this.logger.error(
			`Error: ${status} - ${exception.message}`,
			exception.stack
		)

		response.status(status).json({
			statusCode: status,
			message: exception.message
		})
	}
}
