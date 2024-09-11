import { IsInt, IsNotEmpty, Min } from "class-validator"

export class CreateTaskPriorityStatusDto {
	@IsNotEmpty({ message: "Please provide name of priority!" })
	name: string

	@IsInt({ message: "Wrong format!" })
	@Min(1, { message: "Priority must be at least 1!" })
	priority: number
}
