import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post
} from "@nestjs/common"
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from "@nestjs/swagger"
import { CreateTaskPriorityStatusDto } from "./dto/create-task-priority-status.dto"
import { UpdateTaskPriorityStatusDto } from "./dto/update-task-priority-status.dto"
import { TaskPriorityStatus } from "./task-priority-status.entity"
import { TaskPriorityStatusService } from "./task-priority-status.service"

@ApiTags("Task Priority Status")
@Controller("task-priority-status")
export class TaskPriorityStatusController {
	constructor(
		private readonly taskPriorityStatusService: TaskPriorityStatusService
	) {}

	@Post()
	@ApiOperation({ summary: "Create a new task priority status" })
	@ApiBody({
		type: CreateTaskPriorityStatusDto,
		description: "JSON structure for creating a new task priority status"
	})
	@ApiResponse({
		status: 201,
		description: "The task priority status has been successfully created.",
		example: {
			id: 1,
			name: "In Progress",
			priority: 2
		}
	})
	@ApiResponse({
		status: 400,
		description: "Invalid data for task priority status creation."
	})
	async createTaskPriorityStatus(
		@Body() createDto: CreateTaskPriorityStatusDto
	): Promise<TaskPriorityStatus> {
		return this.taskPriorityStatusService.createTaskPriorityStatus(createDto)
	}

	@Get()
	@ApiOperation({ summary: "Get all task priority statuses" })
	@ApiResponse({
		status: 200,
		description: "Returns an array of task priority statuses.",
		example: [
			{
				id: 1,
				name: "ToDo",
				priority: 1
			},
			{
				id: 2,
				name: "In Progress",
				priority: 2
			}
		]
	})
	async getAllTaskPriorityStatuses(): Promise<TaskPriorityStatus[]> {
		return this.taskPriorityStatusService.getAllTaskPriorityStatuses()
	}

	@Get(":id")
	@ApiOperation({ summary: "Get task priority status by ID" })
	@ApiParam({
		name: "id",
		description: "ID of the task priority status",
		example: 1
	})
	@ApiResponse({
		status: 200,
		description: "Returns the task priority status with the given ID.",
		example: {
			id: 1,
			name: "ToDo",
			priority: 1
		}
	})
	@ApiResponse({
		status: 404,
		description: "Task priority status not found."
	})
	async getTaskPriorityStatusById(
		@Param("id") id: number
	): Promise<TaskPriorityStatus> {
		return this.taskPriorityStatusService.getTaskPriorityStatusById(id)
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a task priority status by ID" })
	@ApiParam({
		name: "id",
		description: "ID of the task priority status to update",
		example: 1
	})
	@ApiBody({
		type: UpdateTaskPriorityStatusDto,
		description: "JSON structure for updating the task priority status"
	})
	@ApiResponse({
		status: 200,
		description: "The task priority status has been successfully updated.",
		example: {
			id: 1,
			name: "ToDo",
			priority: 1
		}
	})
	@ApiResponse({
		status: 404,
		description: "Task priority status not found."
	})
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
	@ApiOperation({ summary: "Delete a task priority status by ID" })
	@ApiParam({
		name: "id",
		description: "ID of the task priority status to delete",
		example: 1
	})
	@ApiResponse({
		status: 204,
		description: "The task priority status has been successfully deleted."
	})
	@ApiResponse({
		status: 404,
		description: "Task priority status not found."
	})
	async deleteTaskPriorityStatus(@Param("id") id: number): Promise<void> {
		return this.taskPriorityStatusService.deleteTaskPriorityStatus(id)
	}
}
