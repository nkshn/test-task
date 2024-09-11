import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { TaskPriorityStatus } from "./task-priority-status.entity"
import { TaskPriorityStatusService } from "./task-priority-status.service"
import { TaskPriorityStatusController } from "./task-priority-status.controller"

@Module({
	imports: [TypeOrmModule.forFeature([TaskPriorityStatus])],
	providers: [TaskPriorityStatusService],
	controllers: [TaskPriorityStatusController],
	exports: [TypeOrmModule]
})
export class TaskPriorityStatusModule {}
