import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { QueueService } from '../queue/queue.service';
import { RequestType } from './enums/request-type.enum';
import { IStorageRequest } from './interfaces/storage-request.interface';
import { IStorageResponse } from './interfaces/storage-response.interface';

@Injectable()
export class StorageService {
  constructor(private readonly queueService: QueueService) {}

  private storage = {};
  public static readonly incomingQueue = 'INCOME_QUEUE';
  public static readonly outgoingQueue = 'OUTCOME_QUEUE';

  public get(key: IStorageResponse['key']): IStorageResponse {
    return this.storage[key];
  }

  public set(
    key: IStorageResponse['key'],
    value: IStorageResponse['value'],
  ): IStorageResponse {
    this.storage[key] = value;
    return this.storage[key];
  }

  public delete(key: IStorageResponse['key']): IStorageResponse {
    const value = this.storage[key];
    delete this.storage[key];
    return value;
  }

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'config',
    queue: StorageService.incomingQueue,
  })
  public async ackStorageRequest(request: IStorageRequest): Promise<void> {
    return this.handleRequest(request);
  }

  public async handleRequest(request: IStorageRequest): Promise<void> {
    const response: IStorageResponse = Object.assign(
      { value: {} },
      JSON.parse(JSON.stringify(request)),
    );

    const { type, key, value } = request;

    switch (type) {
      case RequestType.GET:
        response.value = this.get(key);
        break;
      case RequestType.SET:
        response.value = this.set(key, value);
        break;
      case RequestType.DELETE:
        response.value = this.delete(key);
        break;
    }

    fs.appendFile(
      path.join(__dirname, '../..', 'storage', 'log'),
      JSON.stringify(request) + '\n',
      () => {
        return;
      },
    );

    await this.queueService.addMessage(StorageService.outgoingQueue, response);
  }
}
