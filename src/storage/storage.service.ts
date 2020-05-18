import { Injectable } from '@nestjs/common';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { IStorageRequest } from './interfaces/storage-request.interface';

@Injectable()
export class StorageService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'config',
    queue: 'incoming',
  })
  public async handleIncoming(data: {}): Promise<void> {
    console.log('Received incoming message', data);
  }

  public async process(message: IStorageRequest): Promise<void> {
    return this.amqpConnection.publish('', 'incoming', message);
  }
}
