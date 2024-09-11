import { DataSource } from "typeorm"
import { Seeder } from "typeorm-seeding"
import { TaskPriorityStatus } from "../task-priority-status/task-priority-status.entity"

export default class CreateTaskPriorityStatuses implements Seeder {
	public async run(_: any, dataSource: DataSource): Promise<any> {
		// List of tasks priorities
		const data = [
			{ name: "ToDo", priority: 1 },
			{ name: "InProgress", priority: 2 },
			{ name: "Done", priority: 3 }
		]

		// Inserting the predefined priorities into the database
		await dataSource
			.createQueryBuilder()
			.insert()
			.into(TaskPriorityStatus)
			.values(data)
			.execute()
	}
}
