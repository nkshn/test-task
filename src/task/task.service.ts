import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { SortOrder } from "../common/enums/sort-order.enum"
import { TaskPriorityStatus } from "../task-priority-status/task-priority-status.entity"
import { CreateTaskDto } from "./dto/create-task.dto"
import { UpdateTaskDto } from "./dto/update-task.dto"
import { Task } from "./task.entity"

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(Task)
		private readonly taskRepository: Repository<Task>,

		@InjectRepository(TaskPriorityStatus)
		private readonly taskPriorityStatusRepository: Repository<TaskPriorityStatus>
	) {}

	async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
		const { title, dueDate, priorityId } = createTaskDto

		const priority = await this.taskPriorityStatusRepository.findOne({
			where: { id: priorityId }
		})

		if (!priority) {
			throw new NotFoundException(
				`Priority status with ID ${priorityId} not found`
			)
		}

		const task = this.taskRepository.create({
			title,
			dueDate,
			priority
		})

		return this.taskRepository.save(task)
	}

	async getAllTasks(): Promise<Task[]> {
		return this.taskRepository.find({ relations: ["priority"] })
	}

	async getAllSortedTasks(
		sortByPriority: SortOrder = SortOrder.DESC,
		sortByDate: SortOrder = SortOrder.ASC
	): Promise<Task[]> {
		return this.taskRepository
			.createQueryBuilder("task")
			.leftJoinAndSelect("task.priority", "priority")
			.orderBy("priority.priority", sortByPriority)
			.addOrderBy("task.dueDate", sortByDate)
			.getMany()
	}

	async getTaskById(id: number): Promise<Task> {
		const task = await this.taskRepository.findOne({
			where: { id },
			relations: ["priority"]
		})

		if (!task) {
			throw new NotFoundException(`Task with ID ${id} not found`)
		}

		return task
	}

	async updateTask(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
		const task = await this.getTaskById(id)

		if (!task) {
			throw new NotFoundException(`Task with ID ${id} not found`)
		}

		if (updateTaskDto.priorityId) {
			const status = await this.taskPriorityStatusRepository.findOne({
				where: { id: updateTaskDto.priorityId }
			})

			if (!status) {
				throw new NotFoundException(
					`Priority status with ID ${updateTaskDto.priorityId} not found`
				)
			}

			task.priority = status
		}

		const updatedTask = {
			...task,
			title: updateTaskDto.title || task.title,
			dueDate: new Date(updateTaskDto.dueDate || task.dueDate).toISOString()
		}

		return this.taskRepository.save(updatedTask)
	}

	async deleteTask(id: number): Promise<boolean> {
		const task = await this.taskRepository.findOne({ where: { id } })

		if (!task) {
			throw new NotFoundException(`Task with ID ${id} not found`)
		}

		const result = await this.taskRepository.delete(id)

		if (result.affected === 0) {
			throw new NotFoundException(`Task with ID ${id} not found`)
		}

		return true
	}
}
