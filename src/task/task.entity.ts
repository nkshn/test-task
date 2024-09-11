import { TaskPriorityStatus } from "../task-priority-status/task-priority-status.entity"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Task {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	title: string

	@Column({
		type: "timestamp",
		name: "due_date",
		default: () => "CURRENT_TIMESTAMP"
	})
	dueDate: Date

	@ManyToOne(() => TaskPriorityStatus, priorityStatus => priorityStatus.tasks)
	priority: TaskPriorityStatus
}
