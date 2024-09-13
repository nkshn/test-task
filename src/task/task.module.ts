import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RedisCacheService } from "../redis-cache/redis-cache.service"
import { TaskPriorityStatusModule } from "../task-priority-status/task-priority-status.module" // Import TaskPriorityStatusModule
import { TasksController } from "./task.controller"
import { Task } from "./task.entity"
import { TasksService } from "./task.service"

@Module({
	imports: [TypeOrmModule.forFeature([Task]), TaskPriorityStatusModule],
	providers: [TasksService, RedisCacheService],
	controllers: [TasksController]
})
export class TaskModule {}
