import { PartialType } from "@nestjs/mapped-types"
import { CreateTaskPriorityStatusDto } from "./create-task-priority-status.dto"

export class UpdateTaskPriorityStatusDto extends PartialType(
	CreateTaskPriorityStatusDto
) {}
