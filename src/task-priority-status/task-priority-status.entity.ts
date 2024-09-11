import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Task } from "../task/task.entity"

@Entity()
export class TaskPriorityStatus {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	priority: number

	@OneToMany(() => Task, task => task.priority)
	tasks: Task[]
}
