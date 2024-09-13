import { CacheModule } from "@nestjs/cache-manager"
import { Logger, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { redisStore } from "cache-manager-redis-yet"
import { RedisCacheModule } from "./redis-cache/redis-cache.module"
import { TaskPriorityStatus } from "./task-priority-status/task-priority-status.entity"
import { TaskPriorityStatusModule } from "./task-priority-status/task-priority-status.module"
import { Task } from "./task/task.entity"
import { TaskModule } from "./task/task.module"

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		TypeOrmModule.forRoot({
			type: "postgres",
			host: process.env.DATABASE_HOST,
			port: parseInt(process.env.DATABASE_PORT, 10),
			username: process.env.DATABASE_USERNAME,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_NAME,
			autoLoadEntities: true,
			entities: [Task, TaskPriorityStatus],
			synchronize: process.env.NODE_ENV !== "production" // only for local environment
		}),
		CacheModule.registerAsync({
			isGlobal: true,
			useFactory: async () => {
				const logger = new Logger("RedisCacheDB")

				try {
					const store = await redisStore({
						socket: {
							host: process.env.REDIS_HOST,
							port: parseInt(process.env.REDIS_PORT, 10)
						},
						name: process.env.REDIS_NAME,
						ttl: parseInt(process.env.REDIS_TTL, 10) || 60000
					})

					logger.log("Redis connected successfully")

					return {
						store
					}
				} catch (err) {
					logger.error("Redis connection failed", err)
					throw new Error("Failed to connect to Redis")
				}
			}
		}),
		TaskPriorityStatusModule,
		TaskModule,
		RedisCacheModule
	]
})
export class AppModule {}
