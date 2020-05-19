import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [QueueModule, StorageModule],
})
export class AppModule {}
