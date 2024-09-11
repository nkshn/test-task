import { Module } from "@nestjs/common"
import { TasksService } from "./task.service"
import { TasksController } from "./task.controller"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Task } from "./task.entity"
import { TaskPriorityStatusModule } from "../task-priority-status/task-priority-status.module" // Import TaskPriorityStatusModule

@Module({
	imports: [TypeOrmModule.forFeature([Task]), TaskPriorityStatusModule],
	providers: [TasksService],
	controllers: [TasksController]
})
export class TaskModule {}
