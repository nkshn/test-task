import { ApiProperty } from "@nestjs/swagger"
import { IsDateString, IsInt, IsNotEmpty, IsString } from "class-validator"

export class CreateTaskDto {
	@ApiProperty({
		name: "title",
		description: "This is title of new task",
		example: "New task title",
		required: true
	})
	@IsNotEmpty({ message: "Title of new task must be provided!" })
	@IsString({ message: "Wrong format!" })
	title: string

	@ApiProperty({
		name: "dueDate",
		description: "This is the date of due date of new task",
		example: "2024-09-11T22:33:18.000Z",
		required: true
	})
	@IsNotEmpty({ message: "Task due date must be provided!" })
	@IsDateString({}, { message: "Wrong format!" })
	dueDate: string

	@ApiProperty({
		name: "priorityId",
		description: "This is ID of the Task Priority Status",
		example: 1,
		required: true,
		minimum: 1
	})
	@IsNotEmpty({ message: "Priority of task must be chosen!" })
	@IsInt({ message: "Wrong format!" })
	priorityId: number
}
