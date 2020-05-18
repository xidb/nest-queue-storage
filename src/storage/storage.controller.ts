import { Controller, Body, Post } from '@nestjs/common';
import { StorageRequestDto } from './dto/storage-request.dto';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  async process(@Body() message: StorageRequestDto): Promise<void> {
    return this.storageService.process(message);
  }
}
