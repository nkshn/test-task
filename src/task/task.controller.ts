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
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"
import { Task } from "./task.entity"
import { TasksService } from "./task.service"

@Controller("tasks")
export class TasksController {
	constructor(private readonly tasksService: TasksService) {}

	@Post()
	async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
		return this.tasksService.createTask(createTaskDto)
	}

	@Get()
	async getAllTasks(): Promise<Task[]> {
		return this.tasksService.getAllTasks()
	}

	@Get("sorted")
	async getAllSortedTasks(
		@Query("sortByPriority", new SortOrderPipe(SortOrder.DESC))
		sortByPriority: SortOrder,
		@Query("sortByDate", new SortOrderPipe(SortOrder.ASC)) sortByDate: SortOrder
	): Promise<Task[]> {
		return this.tasksService.getAllSortedTasks(sortByPriority, sortByDate)
	}

	@Get(":id")
	async getTaskById(@Param("id") id: number): Promise<Task> {
		return this.tasksService.getTaskById(id)
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
