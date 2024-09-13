import { Test, TestingModule } from "@nestjs/testing"
import { TaskPriorityStatusService } from "./task-priority-status.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { TaskPriorityStatus } from "./task-priority-status.entity"
import { NotFoundException } from "@nestjs/common"
import { CreateTaskPriorityStatusDto } from "./dto/create-task-priority-status.dto"
import { UpdateTaskPriorityStatusDto } from "./dto/update-task-priority-status.dto"

describe("TaskPriorityStatusService", () => {
	let service: TaskPriorityStatusService
	let repository: Repository<TaskPriorityStatus>

	const mockTaskPriorityStatusRepository = {
		create: jest.fn(),
		save: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		delete: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TaskPriorityStatusService,
				{
					provide: getRepositoryToken(TaskPriorityStatus),
					useValue: mockTaskPriorityStatusRepository
				}
			]
		}).compile()

		service = module.get<TaskPriorityStatusService>(TaskPriorityStatusService)
		repository = module.get<Repository<TaskPriorityStatus>>(
			getRepositoryToken(TaskPriorityStatus)
		)
	})

	afterEach(() => {
		jest.clearAllMocks() // Clear all mocks after each test
	})

	it("should be defined", () => {
		expect(service).toBeDefined()
	})

	describe("createTaskPriorityStatus", () => {
		it("should create and save a priority status", async () => {
			const createDto: CreateTaskPriorityStatusDto = {
				name: "High",
				priority: 1
			}
			const priorityStatus = { id: 1, ...createDto }

			mockTaskPriorityStatusRepository.create.mockReturnValue(priorityStatus)
			mockTaskPriorityStatusRepository.save.mockResolvedValue(priorityStatus)

			const result = await service.createTaskPriorityStatus(createDto)

			expect(repository.create).toHaveBeenCalledWith(createDto)
			expect(repository.save).toHaveBeenCalledWith(priorityStatus)
			expect(result).toEqual(priorityStatus)
		})
	})

	describe("getAllTaskPriorityStatuses", () => {
		it("should return an array of priority statuses", async () => {
			const priorityStatuses = [{ id: 1, name: "High", priority: 1 }]
			mockTaskPriorityStatusRepository.find.mockResolvedValue(priorityStatuses)

			const result = await service.getAllTaskPriorityStatuses()

			expect(repository.find).toHaveBeenCalled()
			expect(result).toEqual(priorityStatuses)
		})
	})

	describe("getTaskPriorityStatusById", () => {
		it("should return a priority status if found", async () => {
			const priorityStatus = { id: 1, name: "High", priority: 1 }
			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(priorityStatus)

			const result = await service.getTaskPriorityStatusById(1)

			expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
			expect(result).toEqual(priorityStatus)
		})

		it("should throw NotFoundException if priority status not found", async () => {
			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(null)

			await expect(service.getTaskPriorityStatusById(999)).rejects.toThrow(
				new NotFoundException("Priority status with ID 999 not found")
			)
		})
	})

	describe("updateTaskPriorityStatus", () => {
		it("should update and return the updated priority status", async () => {
			const updateDto: UpdateTaskPriorityStatusDto = {
				name: "Updated High",
				priority: 2
			}
			const existingPriorityStatus = { id: 1, name: "High", priority: 1 }
			const updatedPriorityStatus = { ...existingPriorityStatus, ...updateDto }

			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(
				existingPriorityStatus
			)
			mockTaskPriorityStatusRepository.save.mockResolvedValue(
				updatedPriorityStatus
			)

			const result = await service.updateTaskPriorityStatus(1, updateDto)

			expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
			expect(repository.save).toHaveBeenCalledWith(updatedPriorityStatus)
			expect(result).toEqual(updatedPriorityStatus)
		})

		it("should throw NotFoundException if priority status to update is not found", async () => {
			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(null)

			await expect(
				service.updateTaskPriorityStatus(999, { name: "Non-existent" })
			).rejects.toThrow(
				new NotFoundException("Priority status with ID 999 not found")
			)
		})
	})

	describe("deleteTaskPriorityStatus", () => {
		it("should delete a priority status", async () => {
			const priorityStatus = { id: 1, name: "High" }

			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(priorityStatus)
			mockTaskPriorityStatusRepository.delete.mockResolvedValue({ affected: 1 })

			await service.deleteTaskPriorityStatus(1)

			expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } })
			expect(repository.delete).toHaveBeenCalledWith(1)
		})

		it("should throw NotFoundException if priority status to delete is not found", async () => {
			mockTaskPriorityStatusRepository.findOne.mockResolvedValue(null)

			await expect(service.deleteTaskPriorityStatus(999)).rejects.toThrow(
				new NotFoundException("Priority status with ID 999 not found")
			)
		})
	})
})
