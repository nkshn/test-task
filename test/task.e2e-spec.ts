import {
	BadRequestException,
	INestApplication,
	ValidationPipe
} from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import * as request from "supertest"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Task } from "../src/task/task.entity"
import { TaskModule } from "../src/task/task.module"
import { TaskPriorityStatusModule } from "../src/task-priority-status/task-priority-status.module"
import { TaskPriorityStatus } from "../src/task-priority-status/task-priority-status.entity"
import { CacheModule } from "@nestjs/cache-manager"
import { redisStore } from "cache-manager-redis-yet"
import { ConfigModule } from "@nestjs/config"
import { DataSource } from "typeorm"

describe("Tasks (e2e)", () => {
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
				TaskModule,
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

	describe("/POST tasks", () => {
		it("should create a new task (success)", async () => {
			const priorityStatusResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send({ name: "High Priority", priority: 1 })
				.expect(201)

			const createTaskDto = {
				title: "Test Task",
				dueDate: new Date().toISOString(),
				priorityId: priorityStatusResponse.body.id
			}

			const response = await request(app.getHttpServer())
				.post("/tasks")
				.send(createTaskDto)
				.expect(201)

			expect(response.body).toHaveProperty("id")
			expect(response.body.title).toEqual(createTaskDto.title)
			expect(response.body.priority.id).toEqual(priorityStatusResponse.body.id)
		})

		it("should return 404 if priority status is invalid", async () => {
			const createTaskDto = {
				title: "Test Task with Invalid Priority",
				dueDate: new Date().toISOString(),
				priorityId: 9999 // Invalid priority ID
			}

			const response = await request(app.getHttpServer())
				.post("/tasks")
				.send(createTaskDto)
				.expect(404)

			expect(response.body.message).toEqual(
				"Priority status with ID 9999 not found"
			)
		})

		it("should return 400 if required data is missing", async () => {
			const createTaskDto = {
				dueDate: new Date().toISOString() // Missing title and priorityId
			}

			await request(app.getHttpServer())
				.post("/tasks")
				.send(createTaskDto)
				.expect(400)
		})
	})

	describe("/GET tasks", () => {
		it("should return an array of tasks", async () => {
			const response = await request(app.getHttpServer())
				.get("/tasks")
				.expect(200)

			expect(Array.isArray(response.body)).toBe(true)
		})
	})

	describe("/GET tasks/sorted", () => {
		it("should return tasks sorted by default (DESC for priority, ASC for date) when no query params are provided", async () => {
			const response = await request(app.getHttpServer())
				.get("/tasks/sorted")
				.expect(200)

			expect(Array.isArray(response.body)).toBe(true)

			const [firstTask, secondTask] = response.body

			expect(new Date(firstTask.dueDate).getTime()).toBeLessThanOrEqual(
				new Date(secondTask.dueDate).getTime()
			)
			expect(firstTask.priority.priority).toBeGreaterThanOrEqual(
				secondTask.priority.priority
			)
		})

		it("should return tasks sorted by ASC priority and DESC date when query params are provided", async () => {
			const response = await request(app.getHttpServer())
				.get("/tasks/sorted?sortByPriority=ASC&sortByDate=DESC")
				.expect(200)

			expect(Array.isArray(response.body)).toBe(true)

			const [firstTask, secondTask] = response.body

			expect(firstTask.priority.priority).toBeLessThanOrEqual(
				secondTask.priority.priority
			)
			expect(new Date(firstTask.dueDate).getTime()).toBeGreaterThanOrEqual(
				new Date(secondTask.dueDate).getTime()
			)
		})
	})

	describe("/GET tasks/:id", () => {
		it("should return a task by ID", async () => {
			const priorityStatusResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send({ name: "Medium Priority", priority: 2 })
				.expect(201)

			const createTaskDto = {
				title: "Test Task by ID",
				dueDate: new Date().toISOString(),
				priorityId: priorityStatusResponse.body.id
			}

			const taskResponse = await request(app.getHttpServer())
				.post("/tasks")
				.send(createTaskDto)

			const response = await request(app.getHttpServer())
				.get(`/tasks/${taskResponse.body.id}`)
				.expect(200)

			expect(response.body.title).toEqual(createTaskDto.title)
		})

		it("should return 404 if task is not found", async () => {
			await request(app.getHttpServer()).get("/tasks/9999").expect(404)
		})
	})

	describe("/PATCH tasks/:id", () => {
		it("should update a task", async () => {
			const priorityStatusResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send({ name: "Low Priority", priority: 3 })
				.expect(201)

			const createTaskDto = {
				title: "Task to Update",
				dueDate: new Date().toISOString(),
				priorityId: priorityStatusResponse.body.id
			}

			const taskResponse = await request(app.getHttpServer())
				.post("/tasks")
				.send(createTaskDto)

			const updateTaskDto = {
				title: "Updated Task Title",
				dueDate: new Date().toISOString()
			}

			const response = await request(app.getHttpServer())
				.patch(`/tasks/${taskResponse.body.id}`)
				.send(updateTaskDto)
				.expect(200)

			expect(response.body.title).toEqual("Updated Task Title")
		})

		it("should return 404 if task is not found for update", async () => {
			const updateTaskDto = {
				title: "Non-existent Task",
				dueDate: new Date().toISOString()
			}

			await request(app.getHttpServer())
				.patch("/tasks/9999")
				.send(updateTaskDto)
				.expect(404)
		})
	})

	describe("/DELETE tasks/:id", () => {
		it("should delete a task", async () => {
			const priorityStatusResponse = await request(app.getHttpServer())
				.post("/task-priority-status")
				.send({ name: "Priority for Deletion", priority: 1 })
				.expect(201)

			const createTaskDto = {
				title: "Task to Delete",
				dueDate: new Date().toISOString(),
				priorityId: priorityStatusResponse.body.id
			}

			const taskResponse = await request(app.getHttpServer())
				.post("/tasks")
				.send(createTaskDto)

			await request(app.getHttpServer())
				.delete(`/tasks/${taskResponse.body.id}`)
				.expect(200)
		})

		it("should return 404 if task is not found for deletion", async () => {
			await request(app.getHttpServer()).delete("/tasks/9999").expect(404)
		})
	})
})
