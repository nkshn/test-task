import { IsDateString, IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreateTaskDto {
	@IsNotEmpty({ message: "Title of new task must be provided!" })
	@IsString({ message: "Wrong format!" })
	title: string

	@IsNotEmpty({ message: "Task due date must be provided!" })
	@IsDateString({}, { message: "Wrong format!" })
	dueDate: string

	@IsNotEmpty({ message: "Priority of task must be chosen!" })
	@IsInt({ message: "Wrong format!" })
	priorityId: number
}
