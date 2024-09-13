import { ApiProperty } from "@nestjs/swagger"
import { IsInt, IsNotEmpty, Min } from "class-validator"

export class CreateTaskPriorityStatusDto {
	@ApiProperty({
		name: "name",
		description: "This is the name of new task priority",
		example: "InProgress",
		required: true
	})
	@IsNotEmpty({ message: "Please provide name of priority!" })
	name: string

	@ApiProperty({
		name: "priority",
		description:
			"This is the number of priority. For example, higher number, means higher priority.",
		example: 4,
		required: true,
		minimum: 1
	})
	@IsInt({ message: "Wrong format!" })
	@Min(1, { message: "Priority must be at least 1!" })
	priority: number
}
