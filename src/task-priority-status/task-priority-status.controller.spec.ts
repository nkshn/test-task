// File: src/task-priority-status/task-priority-status.controller.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { TaskPriorityStatusController } from "./task-priority-status.controller"
import { TaskPriorityStatusService } from "./task-priority-status.service"
import { CreateTaskPriorityStatusDto } from "./dto/create-task-priority-status.dto"
import { UpdateTaskPriorityStatusDto } from "./dto/update-task-priority-status.dto"
import { TaskPriorityStatus } from "./task-priority-status.entity"

describe("TaskPriorityStatusController", () => {
	let controller: TaskPriorityStatusController

	const mockTaskPriorityStatusService = {
		createTaskPriorityStatus: jest.fn(),
		getAllTaskPriorityStatuses: jest.fn(),
		getTaskPriorityStatusById: jest.fn(),
		updateTaskPriorityStatus: jest.fn(),
		deleteTaskPriorityStatus: jest.fn()
	}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [TaskPriorityStatusController],
			providers: [
				{
					provide: TaskPriorityStatusService,
					useValue: mockTaskPriorityStatusService
				}
			]
		}).compile()

		controller = module.get<TaskPriorityStatusController>(
			TaskPriorityStatusController
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("should be defined", () => {
		expect(controller).toBeDefined()
	})

	describe("createTaskPriorityStatus", () => {
		it("should create a task priority status", async () => {
			const createDto: CreateTaskPriorityStatusDto = {
				name: "ToDo",
				priority: 1
			}
			const newPriorityStatus: TaskPriorityStatus = {
				id: 1,
				...createDto,
				tasks: []
			} // Add tasks

			mockTaskPriorityStatusService.createTaskPriorityStatus.mockResolvedValue(
				newPriorityStatus
			)

			const result = await controller.createTaskPriorityStatus(createDto)

			expect(result).toEqual(newPriorityStatus)
			expect(
				mockTaskPriorityStatusService.createTaskPriorityStatus
			).toHaveBeenCalledWith(createDto)
		})
	})

	describe("getAllTaskPriorityStatuses", () => {
		it("should return all task priority statuses", async () => {
			const priorityStatuses: TaskPriorityStatus[] = [
				{ id: 1, name: "ToDo", priority: 1, tasks: [] },
				{ id: 2, name: "In Progress", priority: 2, tasks: [] }
			]

			mockTaskPriorityStatusService.getAllTaskPriorityStatuses.mockResolvedValue(
				priorityStatuses
			)

			const result = await controller.getAllTaskPriorityStatuses()

			expect(result).toEqual(priorityStatuses)
			expect(
				mockTaskPriorityStatusService.getAllTaskPriorityStatuses
			).toHaveBeenCalled()
		})
	})

	describe("getTaskPriorityStatusById", () => {
		it("should return a task priority status by ID", async () => {
			const priorityStatus: TaskPriorityStatus = {
				id: 1,
				name: "ToDo",
				priority: 1,
				tasks: []
			}

			mockTaskPriorityStatusService.getTaskPriorityStatusById.mockResolvedValue(
				priorityStatus
			)

			const result = await controller.getTaskPriorityStatusById(1)

			expect(result).toEqual(priorityStatus)
			expect(
				mockTaskPriorityStatusService.getTaskPriorityStatusById
			).toHaveBeenCalledWith(1)
		})
	})

	describe("updateTaskPriorityStatus", () => {
		it("should update and return the updated task priority status", async () => {
			const updateDto: UpdateTaskPriorityStatusDto = {
				name: "Updated Name",
				priority: 2
			}
			const updatedPriorityStatus: TaskPriorityStatus = {
				id: 1,
				name: "Updated Name",
				priority: 2,
				tasks: []
			} // Add tasks

			mockTaskPriorityStatusService.updateTaskPriorityStatus.mockResolvedValue(
				updatedPriorityStatus
			)

			const result = await controller.updateTaskPriorityStatus(1, updateDto)

			expect(result).toEqual(updatedPriorityStatus)
			expect(
				mockTaskPriorityStatusService.updateTaskPriorityStatus
			).toHaveBeenCalledWith(1, updateDto)
		})

		it("should throw a NotFoundException if task priority status to update is not found", async () => {
			mockTaskPriorityStatusService.updateTaskPriorityStatus.mockRejectedValue(
				new Error("NotFoundException")
			)

			await expect(
				controller.updateTaskPriorityStatus(999, { name: "Non-existent" })
			).rejects.toThrow("NotFoundException")
			expect(
				mockTaskPriorityStatusService.updateTaskPriorityStatus
			).toHaveBeenCalledWith(999, { name: "Non-existent" })
		})
	})

	describe("deleteTaskPriorityStatus", () => {
		it("should delete a task priority status", async () => {
			mockTaskPriorityStatusService.deleteTaskPriorityStatus.mockResolvedValue(
				undefined
			)

			await controller.deleteTaskPriorityStatus(1)

			expect(
				mockTaskPriorityStatusService.deleteTaskPriorityStatus
			).toHaveBeenCalledWith(1)
		})

		it("should throw NotFoundException if task priority status not found during deletion", async () => {
			mockTaskPriorityStatusService.deleteTaskPriorityStatus.mockRejectedValue(
				new Error("NotFoundException")
			)

			await expect(controller.deleteTaskPriorityStatus(999)).rejects.toThrow(
				"NotFoundException"
			)
			expect(
				mockTaskPriorityStatusService.deleteTaskPriorityStatus
			).toHaveBeenCalledWith(999)
		})
	})
})
