import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
	Logger
} from "@nestjs/common"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name)

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest()
		const { method, url } = request

		this.logger.log(`Incoming Request: ${method} ${url}`)

		const now = Date.now()
		return next
			.handle()
			.pipe(
				tap(() =>
					this.logger.log(`Request ${method} ${url} took ${Date.now() - now}ms`)
				)
			)
	}
}
