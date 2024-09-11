import { Seeder } from "typeorm-seeding"
import { DataSource } from "typeorm"
import { Task } from "../task/task.entity"
import { TaskPriorityStatus } from "../task-priority-status/task-priority-status.entity"

export default class CreateTasks implements Seeder {
	public async run(_: any, dataSource: DataSource): Promise<any> {
		const priorityStatusRepository =
			dataSource.getRepository(TaskPriorityStatus)

		// Fetch all task priority statuses from the database
		const [todoStatus, inProgressStatus, doneStatus] =
			await priorityStatusRepository.find({
				where: [{ name: "ToDo" }, { name: "InProgress" }, { name: "Done" }]
			})

		// Predefined list of to do tasks
		const tasksToDo = [
			{
				title: "Task for to do v1",
				dueDate: new Date("2024-09-01 9:00:00"),
				priority: todoStatus
			},
			{
				title: "Task for to do v2",
				dueDate: new Date("2024-09-01 15:00:00"),
				priority: todoStatus
			}
		]

		// Predefined list of tasks in progress
		const tasksInProgress = [
			{
				title: "Task in progress v1",
				dueDate: new Date("2024-09-03 18:00:00"),
				priority: inProgressStatus
			},
			{
				title: "Task in progress v2",
				dueDate: new Date("2024-09-03 21:00:00"),
				priority: inProgressStatus
			}
		]

		// Predefined list of done tasks
		const doneTasks = [
			{
				title: "Done task v1",
				dueDate: new Date("2024-09-06 02:00:00"),
				priority: doneStatus
			},
			{
				title: "Done task v2",
				dueDate: new Date("2024-09-06 04:00:00"),
				priority: doneStatus
			}
		]

		// Inserting the predefined tasks into the database
		await dataSource
			.createQueryBuilder()
			.insert()
			.into(Task)
			.values([...tasksToDo, ...tasksInProgress, ...doneTasks])
			.execute()
	}
}
