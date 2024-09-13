import { Test, TestingModule } from "@nestjs/testing"
import { TasksController } from "./task.controller"
import { TasksService } from "./task.service"
import { RedisCacheService } from "../redis-cache/redis-cache.service"
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"
import { SortOrder } from "../common/enums/sort-order.enum"

describe("TasksController", () => {
	let controller: TasksController

	const mockTasksService = {
		createTask: jest.fn(),
		getAllTasks: jest.fn(),
		getAllSortedTasks: jest.fn(),
		getTaskById: jest.fn(),
		updateTask: jest.fn(),
		deleteTask: jest.fn()
	}

	const mockRedisCacheService = {
		get: jest.fn(),
		set: jest.fn(),
		del: jest.fn(),
		delKeysByPattern: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TasksController],
			providers: [
				{
					provide: TasksService,
					useValue: mockTasksService
				},
				{
					provide: RedisCacheService,
					useValue: mockRedisCacheService
				}
			]
		}).compile()

		controller = module.get<TasksController>(TasksController)
	})

	afterEach(() => {
		jest.clearAllMocks() // Clear mocks after each test
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	describe("createTask", () => {
		it("should create a task and invalidate cache", async () => {
			const createTaskDto: CreateTaskDto = {
				title: "Test Task",
				dueDate: new Date().toISOString(),
				priorityId: 1
			}
			const newTask = { id: 1, ...createTaskDto }

			mockTasksService.createTask.mockResolvedValue(newTask)
			mockRedisCacheService.delKeysByPattern.mockResolvedValue(null)

			const result = await controller.createTask(createTaskDto)

			expect(result).toEqual(newTask)
			expect(mockTasksService.createTask).toHaveBeenCalledWith(createTaskDto)
			expect(mockRedisCacheService.delKeysByPattern).toHaveBeenCalledWith(
				"*all_tasks*"
			)
		})
	})

	describe("getAllTasks", () => {
		it("should return tasks from cache if available", async () => {
			const cachedTasks = [{ id: 1, title: "Test Task" }]
			mockRedisCacheService.get.mockResolvedValue(cachedTasks)

			const result = await controller.getAllTasks()

			expect(result).toEqual(cachedTasks)
			expect(mockRedisCacheService.get).toHaveBeenCalledWith("all_tasks")
			expect(mockTasksService.getAllTasks).not.toHaveBeenCalled()
		})

		it("should return tasks from service if cache is empty", async () => {
			const tasks = [{ id: 1, title: "Test Task" }]
			mockRedisCacheService.get.mockResolvedValue(null)
			mockTasksService.getAllTasks.mockResolvedValue(tasks)

			const result = await controller.getAllTasks()

			expect(result).toEqual(tasks)
			expect(mockTasksService.getAllTasks).toHaveBeenCalled()
			expect(mockRedisCacheService.set).toHaveBeenCalledWith(
				"all_tasks",
				tasks,
				60000
			)
		})
	})

	describe("getAllSortedTasks", () => {
		it("should return sorted tasks from cache if available", async () => {
			const cachedSortedTasks = [{ id: 1, title: "Test Task" }]
			mockRedisCacheService.get.mockResolvedValue(cachedSortedTasks)

			const result = await controller.getAllSortedTasks(
				SortOrder.DESC,
				SortOrder.ASC
			)

			expect(result).toEqual(cachedSortedTasks)
			expect(mockRedisCacheService.get).toHaveBeenCalledWith(
				"sorted_all_tasks_priority-DESC_date-ASC"
			)
			expect(mockTasksService.getAllSortedTasks).not.toHaveBeenCalled()
		})

		it("should return sorted tasks from service if cache is empty", async () => {
			const sortedTasks = [{ id: 1, title: "Test Task" }]
			mockRedisCacheService.get.mockResolvedValue(null)
			mockTasksService.getAllSortedTasks.mockResolvedValue(sortedTasks)

			const result = await controller.getAllSortedTasks(
				SortOrder.DESC,
				SortOrder.ASC
			)

			expect(result).toEqual(sortedTasks)
			expect(mockTasksService.getAllSortedTasks).toHaveBeenCalledWith(
				SortOrder.DESC,
				SortOrder.ASC
			)
			expect(mockRedisCacheService.set).toHaveBeenCalledWith(
				"sorted_all_tasks_priority-DESC_date-ASC",
				sortedTasks,
				60000
			)
		})
	})

	describe("getTaskById", () => {
		it("should return task from cache if available", async () => {
			const cachedTask = { id: 1, title: "Test Task" }
			mockRedisCacheService.get.mockResolvedValue(cachedTask)

			const result = await controller.getTaskById(1)

			expect(result).toEqual(cachedTask)
			expect(mockRedisCacheService.get).toHaveBeenCalledWith("task_1")
			expect(mockTasksService.getTaskById).not.toHaveBeenCalled()
		})

		it("should return task from service if cache is empty", async () => {
			const task = { id: 1, title: "Test Task" }
			mockRedisCacheService.get.mockResolvedValue(null)
			mockTasksService.getTaskById.mockResolvedValue(task)

			const result = await controller.getTaskById(1)

			expect(result).toEqual(task)
			expect(mockTasksService.getTaskById).toHaveBeenCalledWith(1)
			expect(mockRedisCacheService.set).toHaveBeenCalledWith(
				"task_1",
				task,
				60000
			)
		})
	})

	describe("updateTask", () => {
		it("should update a task and invalidate cache", async () => {
			const updateTaskDto: UpdateTaskDto = {
				title: "Updated Task",
				dueDate: new Date().toISOString()
			}
			const updatedTask = { id: 1, ...updateTaskDto }

			mockTasksService.updateTask.mockResolvedValue(updatedTask)
			mockRedisCacheService.delKeysByPattern.mockResolvedValue(null)
			mockRedisCacheService.del.mockResolvedValue(null)

			const result = await controller.updateTask(1, updateTaskDto)

			expect(result).toEqual(updatedTask)
			expect(mockTasksService.updateTask).toHaveBeenCalledWith(1, updateTaskDto)
			expect(mockRedisCacheService.delKeysByPattern).toHaveBeenCalledWith(
				"*all_tasks*"
			)
			expect(mockRedisCacheService.del).toHaveBeenCalledWith("task_1")
		})
	})

	describe("deleteTask", () => {
		it("should delete a task and invalidate cache", async () => {
			mockTasksService.deleteTask.mockResolvedValue(true)
			mockRedisCacheService.delKeysByPattern.mockResolvedValue(null)
			mockRedisCacheService.del.mockResolvedValue(null)

			await controller.deleteTask(1)

			expect(mockTasksService.deleteTask).toHaveBeenCalledWith(1)
			expect(mockRedisCacheService.delKeysByPattern).toHaveBeenCalledWith(
				"*all_tasks*"
			)
			expect(mockRedisCacheService.del).toHaveBeenCalledWith("task_1")
		})
	})
})
