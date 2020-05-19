import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class QueueService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  public async addMessage(queue: string, request: {}): Promise<void> {
    return this.amqpConnection.publish('', queue, request);
  }
}
