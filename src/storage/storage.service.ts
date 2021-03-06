import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { QueueService } from '../queue/queue.service';
import { RequestType } from './enums/request-type.enum';
import { IStorageRequest } from './interfaces/storage-request.interface';
import { IStorageResponse } from './interfaces/storage-response.interface';

@Injectable()
export class StorageService {
  constructor(private readonly queueService: QueueService) {
    if (!fs.existsSync(StorageService.dirPath)) {
      fs.mkdirSync(StorageService.dirPath);
    }
    this.loadSnapshot();
    this.replayLog();
  }

  private readonly logger = new Logger(StorageService.name);

  private storage = {};
  private static readonly snapshotInterval = CronExpression.EVERY_MINUTE;
  private static readonly dirPath = path.join(__dirname, '../..', 'storage');
  private static readonly snapshotPath = path.join(
    StorageService.dirPath,
    'snapshot',
  );
  private static readonly logPath = path.join(StorageService.dirPath, 'log');

  public static readonly incomingQueue = 'INCOME_QUEUE';
  public static readonly outgoingQueue = 'OUTCOME_QUEUE';

  @Cron(StorageService.snapshotInterval)
  private async saveSnapshot(): Promise<void> {
    const storageString = JSON.stringify(this.storage);

    await fs.writeFile(StorageService.snapshotPath, storageString, () => {
      return;
    });
    // TODO create multiple log files, on saving a snapshot delete
    //  old one start writing in new to not lose some requests,
    //  happening on deleting a file
    await fs.writeFile(StorageService.logPath, '', () => {
      return;
    });

    const size = (Buffer.byteLength(storageString) / 1024).toFixed(2);
    return this.logger.debug(`Snapshot saved (~${size}K)`);
  }

  private loadSnapshot(): void {
    if (!fs.existsSync(StorageService.snapshotPath)) {
      return;
    }

    this.storage = JSON.parse(
      fs.readFileSync(StorageService.snapshotPath, 'utf8'),
    );
  }

  private replayLog(): void {
    if (!fs.existsSync(StorageService.logPath)) {
      return;
    }

    const log = fs.readFileSync(StorageService.logPath, 'utf8');
    const requests = log.split('\n');
    requests
      .filter(r => Boolean(r))
      .map(r => this.mutateStorage(JSON.parse(r)));
  }

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

  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'config',
    queue: StorageService.outgoingQueue,
  })
  public async debugOutgoingResponse(
    response: IStorageResponse,
  ): Promise<void> {
    return this.logger.debug(
      `${StorageService.outgoingQueue}: ${JSON.stringify(response)}`,
    );
  }

  public async handleRequest(request: IStorageRequest): Promise<void> {
    const response = this.mutateStorage(request);

    fs.appendFile(
      StorageService.logPath,
      JSON.stringify(request) + '\n',
      () => {
        return;
      },
    );

    return this.queueService.addMessage(StorageService.outgoingQueue, response);
  }

  private mutateStorage(request: IStorageRequest): IStorageResponse {
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

    return response;
  }
}
