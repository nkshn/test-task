import { DataSource } from "typeorm"
import { Seeder } from "typeorm-seeding"
import { TaskPriorityStatus } from "../task-priority-status/task-priority-status.entity"
import { Task } from "../task/task.entity"

export default class ClearDatabase implements Seeder {
	public async run(_: any, dataSource: DataSource): Promise<void> {
		// Get repositories for each table
		const taskRepository = dataSource.getRepository(Task)
		const taskPriorityStatusRepository =
			dataSource.getRepository(TaskPriorityStatus)

		// Delete all tasks first (since they depend on TaskPriorityStatus)
		await taskRepository.delete({})

		// Delete all TaskPriorityStatus entries
		await taskPriorityStatusRepository.delete({})

		// Reset auto-increment sequences (PostgreSQL example)
		await dataSource.query(`ALTER SEQUENCE task_id_seq RESTART WITH 1;`)
		await dataSource.query(
			`ALTER SEQUENCE task_priority_status_id_seq RESTART WITH 1;`
		)

		console.log("Database cleared and auto-increment reseted!") // eslint-disable-line no-console
	}
}
