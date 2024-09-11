import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { CreateTaskPriorityStatusDto } from "./dto/create-task-priority-status.dto"
import { UpdateTaskPriorityStatusDto } from "./dto/update-task-priority-status.dto"
import { TaskPriorityStatus } from "./task-priority-status.entity"

@Injectable()
export class TaskPriorityStatusService {
	constructor(
		@InjectRepository(TaskPriorityStatus)
		private readonly taskPriorityStatusRepository: Repository<TaskPriorityStatus>
	) {}

	async createTaskPriorityStatus(
		createDto: CreateTaskPriorityStatusDto
	): Promise<TaskPriorityStatus> {
		const priorityStatus = this.taskPriorityStatusRepository.create(createDto)
		return this.taskPriorityStatusRepository.save(priorityStatus)
	}

	async getAllTaskPriorityStatuses(): Promise<TaskPriorityStatus[]> {
		return this.taskPriorityStatusRepository.find()
	}

	async getTaskPriorityStatusById(id: number): Promise<TaskPriorityStatus> {
		const status = await this.taskPriorityStatusRepository.findOne({
			where: { id }
		})

		if (!status) {
			throw new NotFoundException(`Priority status with ID ${id} not found`)
		}

		return status
	}

	async updateTaskPriorityStatus(
		id: number,
		updateDto: UpdateTaskPriorityStatusDto
	): Promise<TaskPriorityStatus> {
		const status = await this.getTaskPriorityStatusById(id)

		if (!status) {
			throw new NotFoundException(`Priority status with ID ${id} not found`)
		}

		return this.taskPriorityStatusRepository.save({
			...status,
			...updateDto
		})
	}

	async deleteTaskPriorityStatus(id: number): Promise<void> {
		const status = await this.taskPriorityStatusRepository.findOne({
			where: { id }
		})

		if (!status) {
			throw new NotFoundException(`Priority status with ID ${id} not found`)
		}

		const result = await this.taskPriorityStatusRepository.delete(id)

		if (result.affected === 0) {
			throw new NotFoundException(`Priority status with ID ${id} not found`)
		}
	}
}
