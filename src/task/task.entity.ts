import { TaskPriorityStatus } from "src/task-priority-status/task-priority-status.entity"
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Task {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	title: string

	@Column({ type: "date" })
	dueDate: Date

	@ManyToOne(() => TaskPriorityStatus, priorityStatus => priorityStatus.tasks)
	priority: TaskPriorityStatus
}
