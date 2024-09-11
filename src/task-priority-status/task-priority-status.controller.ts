import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from "@nestjs/common"
import { CreateTaskPriorityStatusDto } from "./dto/create-task-priority-status.dto"
import { UpdateTaskPriorityStatusDto } from "./dto/update-task-priority-status.dto"
import { TaskPriorityStatus } from "./task-priority-status.entity"
import { TaskPriorityStatusService } from "./task-priority-status.service"

@Controller("task-priority-status")
export class TaskPriorityStatusController {
	constructor(
		private readonly taskPriorityStatusService: TaskPriorityStatusService
	) {}

	@Post()
	async createTaskPriorityStatus(
		@Body() createDto: CreateTaskPriorityStatusDto
	): Promise<TaskPriorityStatus> {
		return this.taskPriorityStatusService.createTaskPriorityStatus(createDto)
	}

	@Get()
	async getAllTaskPriorityStatuses(): Promise<TaskPriorityStatus[]> {
		return this.taskPriorityStatusService.getAllTaskPriorityStatuses()
	}

	@Get(":id")
	async getTaskPriorityStatusById(
		@Param("id") id: number
	): Promise<TaskPriorityStatus> {
		return this.taskPriorityStatusService.getTaskPriorityStatusById(id)
	}

	@Patch(":id")
	async updateTaskPriorityStatus(
		@Param("id") id: number,
		@Body() updateDto: UpdateTaskPriorityStatusDto
	): Promise<TaskPriorityStatus> {
		return this.taskPriorityStatusService.updateTaskPriorityStatus(
			id,
			updateDto
		)
	}

	@Delete(":id")
	async deleteTaskPriorityStatus(@Param("id") id: number): Promise<void> {
		return this.taskPriorityStatusService.deleteTaskPriorityStatus(id)
	}
}
