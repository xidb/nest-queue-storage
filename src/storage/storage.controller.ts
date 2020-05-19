import { Controller, Body, Post } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { StorageRequestDto } from './dto/storage-request.dto';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  async processStorageRequest(
    @Body() request: StorageRequestDto,
  ): Promise<void> {
    return this.queueService.addMessage(StorageService.incomingQueue, request);
  }
}
