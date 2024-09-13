import { NotFoundException } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { SortOrder } from "../common/enums/sort-order.enum"
import { TaskPriorityStatus } from "../task-priority-status/task-priority-status.entity"
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"
import { Task } from "./task.entity"
import { TasksService } from "./task.service"

describe("TasksService", () => {
	let service: TasksService

	const mockTaskRepository = {
		find: jest.fn(),
		findOne: jest.fn(),
		save: jest.fn(),
		create: jest.fn(),
		delete: jest.fn(),
		createQueryBuilder: jest.fn(() => ({
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockReturnThis(),
			addOrderBy: jest.fn().mockReturnThis(),
			getMany: jest.fn()
		}))
	}

	const mockTaskPriorityStatusRepository = {
		findOne: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TasksService,
				{
					provide: getRepositoryToken(Task),
					useValue: mockTaskRepository
				},
				{
					provide: getRepositoryToken(TaskPriorityStatus),
					useValue: mockTaskPriorityStatusRepository
				}
			]
		}).compile()

		service = module.get<TasksService>(TasksService)
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	describe("createTask", () => {
		it("should create a task successfully", async () => {
			const createTaskDto: CreateTaskDto = {
				title: "Test Task",
				dueDate: "2024-09-01T06:00:00.000Z",
				priorityId: 1
			}
			const priority = { id: 1, name: "ToDo", priority: 1 }
			const task = {
				title: createTaskDto.title,
				dueDate: createTaskDto.dueDate,
				priority
			}

			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(priority)
			mockTaskRepository.create.mockReturnValue(task)
			mockTaskRepository.save.mockResolvedValue(task)

			const result = await service.createTask(createTaskDto)

			expect(mockTaskPriorityStatusRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 }
			})
			expect(mockTaskRepository.create).toHaveBeenCalledWith({
				title: createTaskDto.title,
				dueDate: createTaskDto.dueDate,
				priority
			})
			expect(mockTaskRepository.save).toHaveBeenCalledWith(task)
			expect(result).toEqual(task)
		})

		it("should throw NotFoundException if priority not found", async () => {
			const createTaskDto: CreateTaskDto = {
				title: "Incorrect prioiry id of Test Task",
				dueDate: "2024-09-01T06:00:00.000Z",
				priorityId: 999
			}

			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(null)

			await expect(service.createTask(createTaskDto)).rejects.toThrow(
				new NotFoundException("Priority status with ID 999 not found")
			)
		})
	})

	describe("getAllTasks", () => {
		it("should return an array of tasks", async () => {
			const tasks = [
				{
					id: 1,
					title: "Test Task",
					dueDate: "2024-09-01T06:00:00.000Z",
					priority: { id: 1, name: "ToDo", priority: 1 }
				}
			]
			mockTaskRepository.find.mockResolvedValue(tasks)

			const result = await service.getAllTasks()

			expect(mockTaskRepository.find).toHaveBeenCalledWith({
				relations: ["priority"]
			})
			expect(result).toEqual(tasks)
		})
	})

	describe("getAllSortedTasks", () => {
		it("should return sorted tasks by priority and date", async () => {
			const sortedTasks = [
				{
					id: 1,
					title: "High Priority Task",
					dueDate: "2024-09-01T06:00:00.000Z",
					priority: { id: 2, name: "In Progress", priority: 2 }
				},
				{
					id: 2,
					title: "Low Priority Task",
					dueDate: "2024-09-01T06:00:00.000Z",
					priority: { id: 1, name: "ToDo", priority: 1 }
				}
			]

			mockTaskRepository.createQueryBuilder.mockReturnValue({
				leftJoinAndSelect: jest.fn().mockReturnThis(),
				orderBy: jest.fn().mockReturnThis(),
				addOrderBy: jest.fn().mockReturnThis(),
				getMany: jest.fn().mockResolvedValue(sortedTasks)
			})

			const result = await service.getAllSortedTasks(
				SortOrder.DESC,
				SortOrder.ASC
			)

			expect(result).toEqual(sortedTasks)
		})
	})

	describe("getTaskById", () => {
		it("should return a task if found", async () => {
			const task = {
				id: 1,
				title: "Test Task",
				priority: { id: 1, name: "ToDo", priority: 1 }
			}
			mockTaskRepository.findOne.mockResolvedValue(task)

			const result = await service.getTaskById(1)

			expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
				where: { id: 1 },
				relations: ["priority"]
			})
			expect(result).toEqual(task)
		})

		it("should throw NotFoundException if task not found", async () => {
			mockTaskRepository.findOne.mockResolvedValue(null)

			await expect(service.getTaskById(999)).rejects.toThrow(
				new NotFoundException("Task with ID 999 not found")
			)
		})
	})

	describe("updateTask", () => {
		it("should update a task successfully", async () => {
			const updateTaskDto: UpdateTaskDto = {
				title: "Updated Task",
				dueDate: "2024-09-01T06:00:00.000Z",
				priorityId: 1
			}
			const task = {
				id: 1,
				title: "Old Task",
				dueDate: "2024-08-01T06:00:00.000Z",
				priority: { id: 1, name: "ToDo", priority: 1 }
			}
			const priority = { id: 1, name: "ToDo", priority: 1 }
			const updatedTask = {
				...task,
				title: updateTaskDto.title,
				dueDate: updateTaskDto.dueDate
			}

			mockTaskRepository.findOne.mockResolvedValue(task)
			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(priority)
			mockTaskRepository.save.mockResolvedValue(updatedTask)

			const result = await service.updateTask(1, updateTaskDto)

			expect(result).toEqual(updatedTask)
		})

		it("should throw NotFoundException if task not found", async () => {
			mockTaskRepository.findOne.mockResolvedValue(null)

			await expect(
				service.updateTask(999, { title: "Non-existent Task" })
			).rejects.toThrow(new NotFoundException("Task with ID 999 not found"))
		})
	})

	describe("deleteTask", () => {
		it("should delete a task successfully", async () => {
			const task = { id: 1, title: "Test Task" }

			mockTaskRepository.findOne.mockResolvedValue(task)
			mockTaskRepository.delete.mockResolvedValue({ affected: 1 })

			const result = await service.deleteTask(1)

			expect(result).toEqual(true)
		})

		it("should throw NotFoundException if task not found", async () => {
			mockTaskRepository.findOne.mockResolvedValue(null)

			await expect(service.deleteTask(999)).rejects.toThrow(
				new NotFoundException("Task with ID 999 not found")
			)
		})
	})
})
