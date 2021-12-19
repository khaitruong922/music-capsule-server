import { Injectable } from '@nestjs/common';
import { DownloaderService } from '../downloader/downloader.service';
import { AddToQueueDto } from './stream.interface';

@Injectable()
export class StreamService {
  constructor(private readonly downloaderService: DownloaderService) {}

  async addToQueue(dto: AddToQueueDto) {
    const { url } = dto;
    const { fileName } = await this.downloaderService.saveToDisk({
      url,
      format: 'audioonly',
    });
    return { fileName };
  }
}
