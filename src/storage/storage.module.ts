import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule, ScheduleModule.forRoot()],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
