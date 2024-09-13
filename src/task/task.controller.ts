import {
	Body,
	Controller,
	Delete,
	Get,
	Logger,
	Param,
	Patch,
	Post,
	Query
} from "@nestjs/common"
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags
} from "@nestjs/swagger"
import { SortOrder } from "../common/enums/sort-order.enum"
import { SortOrderPipe } from "../common/pipes/sort-order.pipe"
import { RedisCacheService } from "../redis-cache/redis-cache.service"
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"
import { Task } from "./task.entity"
import { TasksService } from "./task.service"

@ApiTags("Tasks")
@Controller("tasks")
export class TasksController {
	private readonly logger = new Logger(TasksService.name)

	constructor(
		private readonly tasksService: TasksService,
		private readonly redisCacheService: RedisCacheService
	) {}

	@Post()
	@ApiOperation({ summary: "Create a new task" })
	@ApiBody({
		type: CreateTaskDto,
		description: "JSON structure for creating a new task"
	})
	@ApiResponse({
		status: 201,
		description: "The task has been successfully created.",
		example: {
			id: 8,
			title: "new task to do",
			dueDate: "2024-09-11T22:33:18.000Z",
			priority: {
				id: 1,
				name: "ToDo",
				priority: 1
			}
		}
	})
	@ApiResponse({
		status: 404,
		description: "When user pass invalid data",
		example: {
			statusCode: 404,
			message: "Priority status with ID 0 not found"
		}
	})
	async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
		const newTask = await this.tasksService.createTask(createTaskDto)

		if (newTask) {
			try {
				// Invalidate multiple cache keys in parallel using Promise.all
				await Promise.all([
					this.redisCacheService.delKeysByPattern("*all_tasks*")
				])

				this.logger.log("Cache successfully invalidated after task creation")
			} catch (error) {
				this.logger.warn(
					"Failed to invalidate cache after task creation",
					error
				)
			}
		}

		return newTask
	}

	@Get()
	@ApiOperation({ summary: "Get all tasks" })
	@ApiResponse({
		status: 200,
		description: "Returns an array of tasks.",
		example: [
			{
				id: 1,
				title: "Task for to do v1",
				dueDate: "2024-09-01T06:00:00.000Z",
				priority: {
					id: 1,
					name: "ToDo",
					priority: 1
				}
			},
			{
				id: 3,
				title: "Task in progress v1",
				dueDate: "2024-09-03T15:00:00.000Z",
				priority: {
					id: 2,
					name: "InProgress",
					priority: 2
				}
			},
			{
				id: 5,
				title: "Done task v1",
				dueDate: "2024-09-05T23:00:00.000Z",
				priority: {
					id: 3,
					name: "Done",
					priority: 3
				}
			}
		]
	})
	async getAllTasks(): Promise<Task[]> {
		const cacheKey = "all_tasks"

		const cachedTasks = await this.redisCacheService.get<Task[]>(cacheKey)
		if (cachedTasks) {
			return cachedTasks
		}

		const tasks = await this.tasksService.getAllTasks()
		await this.redisCacheService.set(cacheKey, tasks, 600000)

		return tasks
	}

	@Get("sorted")
	@ApiOperation({ summary: "Get all tasks sorted by priority and date" })
	@ApiQuery({
		name: "sortByPriority",
		enum: SortOrder,
		description: "Sort order by task priority (ASC or DESC)",
		required: false
	})
	@ApiQuery({
		name: "sortByDate",
		enum: SortOrder,
		description: "Sort order by task due date (ASC or DESC)",
		required: false
	})
	@ApiResponse({
		status: 200,
		description: "Returns an array of sorted tasks.",
		example: [
			{
				id: 5,
				title: "Done task v1",
				dueDate: "2024-09-05T23:00:00.000Z",
				priority: {
					id: 3,
					name: "Done",
					priority: 3
				}
			},
			{
				id: 3,
				title: "Task in progress v1",
				dueDate: "2024-09-03T15:00:00.000Z",
				priority: {
					id: 2,
					name: "InProgress",
					priority: 2
				}
			},
			{
				id: 8,
				title: "new task to do",
				dueDate: "2024-09-11T22:33:18.000Z",
				priority: {
					id: 1,
					name: "ToDo",
					priority: 1
				}
			}
		]
	})
	async getAllSortedTasks(
		@Query("sortByPriority", new SortOrderPipe(SortOrder.DESC))
		sortByPriority: SortOrder,
		@Query("sortByDate", new SortOrderPipe(SortOrder.ASC)) sortByDate: SortOrder
	): Promise<Task[]> {
		const cacheKey = `sorted_all_tasks_priority-${sortByPriority}_date-${sortByDate}`

		const sortedCachedTasks = await this.redisCacheService.get<Task[]>(cacheKey)
		if (sortedCachedTasks) {
			return sortedCachedTasks
		}

		const sortedTasks = await this.tasksService.getAllSortedTasks(
			sortByPriority,
			sortByDate
		)

		await this.redisCacheService.set(cacheKey, sortedTasks, 600000) // 60000

		return sortedTasks
	}

	@Get(":id")
	@ApiOperation({ summary: "Get task by ID" })
	@ApiParam({ name: "id", description: "Task ID", example: 1, required: true })
	@ApiResponse({
		status: 200,
		description: "Returns a task based on the given ID.",
		example: {
			id: 1,
			title: "Task for to do v1",
			dueDate: "2024-09-01T06:00:00.000Z",
			priority: {
				id: 1,
				name: "ToDo",
				priority: 1
			}
		}
	})
	@ApiResponse({
		status: 404,
		description: "Task not found.",
		example: {
			statusCode: 404,
			message: "Task with ID 0 not found"
		}
	})
	async getTaskById(@Param("id") id: number): Promise<Task> {
		const cacheKey = `task_${id}`

		const sortedCachedTask = await this.redisCacheService.get<Task>(cacheKey)
		if (sortedCachedTask) {
			return sortedCachedTask
		}

		const task = await this.tasksService.getTaskById(id)
		await this.redisCacheService.set(cacheKey, task, 600000)

		return task
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update a task by ID" })
	@ApiParam({ name: "id", description: "Task ID to update", example: 1 })
	@ApiBody({
		type: UpdateTaskDto,
		description: "JSON structure for updating the task"
	})
	@ApiResponse({
		status: 200,
		description: "The task has been successfully updated.",
		example: {
			id: 1,
			title: "Buy groceries and vegetables",
			dueDate: "2024-09-11T22:33:18.000Z",
			priority: {
				id: 2,
				name: "In Progress",
				priority: 2
			}
		}
	})
	@ApiResponse({
		status: 404,
		description: "Task with ID 1 not found"
	})
	async updateTask(
		@Param("id") id: number,
		@Body() updateTaskDto: UpdateTaskDto
	): Promise<Task> {
		const updatedTask = await this.tasksService.updateTask(id, updateTaskDto)

		if (updatedTask) {
			try {
				await Promise.all([
					this.redisCacheService.delKeysByPattern("*all_tasks*"),
					this.redisCacheService.del(`task_${id}`)
				])

				this.logger.log(
					`Cache successfully invalidated after task update for task ID: ${id}`
				)
			} catch (error) {
				this.logger.warn(
					`Failed to invalidate cache after task update for task ID: ${id}`,
					error
				)
			}
		}

		return updatedTask
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a task by ID" })
	@ApiParam({ name: "id", description: "Task ID to delete", example: 1 })
	@ApiResponse({
		status: 204,
		description: "The task has been successfully deleted."
	})
	@ApiResponse({
		status: 404,
		description: "Task with ID 1 not found"
	})
	async deleteTask(@Param("id") id: number): Promise<void> {
		const deleteResult = await this.tasksService.deleteTask(id)

		if (deleteResult) {
			try {
				await Promise.all([
					this.redisCacheService.delKeysByPattern("*all_tasks*"),
					this.redisCacheService.del(`task_${id}`)
				])

				this.logger.log(
					`Cache successfully invalidated after task deletion for task ID: ${id}`
				)
			} catch (error) {
				this.logger.warn(
					`Failed to invalidate cache after task deletion for task ID: ${id}`,
					error
				)
			}
		}
	}
}
