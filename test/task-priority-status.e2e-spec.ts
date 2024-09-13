import { CacheModule } from "@nestjs/cache-manager"
import {
	BadRequestException,
	INestApplication,
	ValidationPipe
} from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { Test, TestingModule } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { redisStore } from "cache-manager-redis-yet"
import * as request from "supertest"
import { DataSource } from "typeorm"
import { TaskPriorityStatus } from "../src/task-priority-status/task-priority-status.entity"
import { TaskPriorityStatusModule } from "../src/task-priority-status/task-priority-status.module"
import { Task } from "../src/task/task.entity"

describe("TaskPriorityStatus (e2e)", () => {
	jest.setTimeout(15000) // Set the timeout to 10 seconds

	let app: INestApplication
	let moduleFixture: TestingModule

	beforeEach(async () => {
		moduleFixture = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({
					isGlobal: true
				}),
				TypeOrmModule.forRoot({
					type: "postgres",
					host: process.env.TEST_DATABASE_HOST || "localhost",
					port: parseInt(process.env.TEST_DATABASE_PORT, 10) || 5432,
					username: process.env.TEST_DATABASE_USERNAME || "test_user",
					password: process.env.TEST_DATABASE_PASSWORD || "test_password",
					database: process.env.TEST_DATABASE_NAME || "test_db",
					entities: [Task, TaskPriorityStatus],
					synchronize: true // Automatically sync schema for testing
				}),
				CacheModule.registerAsync({
					isGlobal: true,
					useFactory: async () => {
						try {
							const store = await redisStore({
								socket: {
									host: process.env.REDIS_HOST,
									port: parseInt(process.env.REDIS_PORT, 10)
								},
								name: process.env.REDIS_NAME,
								ttl: parseInt(process.env.REDIS_TTL, 10) || 60000
							})

							return {
								store
							}
						} catch (err) {
							throw new Error("Failed to connect to Redis")
						}
					}
				}),
				TaskPriorityStatusModule
			]
		}).compile()

		app = moduleFixture.createNestApplication()

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

		await app.init()
	})

	afterEach(async () => {
		await moduleFixture.get<DataSource>(DataSource).destroy()
		await app.close()
	})

	describe("/POST task-priority-status", () => {
		it("should create a new task priority status (success)", async () => {
			const createDto = { name: "High Priority", priority: 1 }

			const response = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send(createDto)
				.expect(201)

			expect(response.body).toHaveProperty("id")
			expect(response.body.name).toEqual("High Priority")
			expect(response.body.priority).toEqual(1)
		})

		it("should return 400 if required data is missing", async () => {
			const createDto = { priority: 1 } // Missing 'name'

			await request(app.getHttpServer())
				.post("/task-priority-status")
				.send(createDto)
				.expect(400)
		})
	})

	describe("/GET task-priority-status", () => {
		it("should return an array of task priority statuses", async () => {
			const response = await request(app.getHttpServer())
				.get("/task-priority-status")
				.expect(200)

			expect(Array.isArray(response.body)).toBe(true)
		})
	})

	describe("/GET task-priority-status/:id", () => {
		it("should return a task priority status by ID", async () => {
			const createDto = { name: "Medium Priority", priority: 2 }
			const createResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send(createDto)
				.expect(201)

			const response = await request(app.getHttpServer())
				.get(`/task-priority-status/${createResponse.body.id}`)
				.expect(200)

			expect(response.body.name).toEqual("Medium Priority")
		})

		it("should return 404 if task priority status is not found", async () => {
			await request(app.getHttpServer())
				.get("/task-priority-status/9999")
				.expect(404)
		})
	})

	describe("/PATCH task-priority-status/:id", () => {
		it("should update a task priority status", async () => {
			const createDto = { name: "Low Priority", priority: 3 }
			const createResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send(createDto)
				.expect(201)

			const updateDto = { name: "Updated Priority", priority: 4 }

			const response = await request(app.getHttpServer())
				.patch(`/task-priority-status/${createResponse.body.id}`)
				.send(updateDto)
				.expect(200)

			expect(response.body.name).toEqual("Updated Priority")
			expect(response.body.priority).toEqual(4)
		})

		it("should return 404 if task priority status is not found for update", async () => {
			const updateDto = { name: "Non-existent Priority", priority: 5 }

			await request(app.getHttpServer())
				.patch("/task-priority-status/9999")
				.send(updateDto)
				.expect(404)
		})
	})

	describe("/DELETE task-priority-status/:id", () => {
		it("should delete a task priority status", async () => {
			const createDto = { name: "Priority for Deletion", priority: 1 }
			const createResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send(createDto)
				.expect(201)

			await request(app.getHttpServer())
				.delete(`/task-priority-status/${createResponse.body.id}`)
				.expect(200)
		})

		it("should return 404 if task priority status is not found for deletion", async () => {
			await request(app.getHttpServer())
				.delete("/task-priority-status/9999")
				.expect(404)
		})
	})
})
