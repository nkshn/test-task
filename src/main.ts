import { BadRequestException, ValidationPipe } from "@nestjs/common"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

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
}

bootstrap()
