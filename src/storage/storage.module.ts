import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: `amqp://guest:guest@${process.env.QUEUE_HOST || 'localhost'}:5672`,
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
