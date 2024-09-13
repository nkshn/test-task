import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query
} from "@nestjs/common"
import { SortOrder } from "../common/enums/sort-order.enum"
import { SortOrderPipe } from "../common/pipes/sort-order.pipe"
import { RedisCacheService } from "../redis-cache/redis-cache.service"
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"
import { Task } from "./task.entity"
import { TasksService } from "./task.service"

@Controller("tasks")
export class TasksController {
	constructor(
		private readonly tasksService: TasksService,
		private readonly redisCacheService: RedisCacheService
	) {}

	@Post()
	async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
		return this.tasksService.createTask(createTaskDto)
	}

	@Get()
	async getAllTasks(): Promise<Task[]> {
		const cacheKey = "all_tasks"

		const cachedTasks = await this.redisCacheService.get<Task[]>(cacheKey)
		if (cachedTasks) {
			return cachedTasks
		}

		const tasks = await this.tasksService.getAllTasks()
		await this.redisCacheService.set(cacheKey, tasks, 60000)

		return tasks
	}

	@Get("sorted")
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
		await this.redisCacheService.set(cacheKey, sortedTasks, 60000)

		return sortedTasks
	}

	@Get(":id")
	async getTaskById(@Param("id") id: number): Promise<Task> {
		const cacheKey = `task_${id}`

		const sortedCachedTask = await this.redisCacheService.get<Task>(cacheKey)
		if (sortedCachedTask) {
			return sortedCachedTask
		}

		const task = await this.tasksService.getTaskById(id)
		await this.redisCacheService.set(cacheKey, task, 60000)

		return task
	}

	@Patch(":id")
	async updateTask(
		@Param("id") id: number,
		@Body() updateTaskDto: UpdateTaskDto
	): Promise<Task> {
		return this.tasksService.updateTask(id, updateTaskDto)
	}

	@Delete(":id")
	async deleteTask(@Param("id") id: number): Promise<void> {
		return this.tasksService.deleteTask(id)
	}
}
