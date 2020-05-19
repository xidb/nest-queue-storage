import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { QueueService } from './queue.service';

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: `amqp://guest:guest@${process.env.QUEUE_HOST || 'localhost'}:5672`,
    }),
  ],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
