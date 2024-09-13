import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter"
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor"

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ["log", "error", "warn", "debug", "verbose"]
	})

	app.useGlobalInterceptors(new LoggingInterceptor())
	app.useGlobalFilters(new AllExceptionsFilter())

	const logger = new Logger("Bootstrap")
	logger.log("Starting the application!")

	// custom error handling for class-validator
	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: errors => {
				const result = errors.map(error => ({
					type: error.property,
					message: error.constraints[Object.keys(error.constraints)[0]]
				}))

				return new BadRequestException(result)
			},
			whitelist: true,
			stopAtFirstError: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	)

	app.getHttpAdapter().getInstance().disable("x-powered-by")
	app.setGlobalPrefix("api")

	await app.listen(3000)

	logger.log("Application is running!")
}

bootstrap()
