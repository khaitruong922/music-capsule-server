import { Injectable } from '@nestjs/common';
import { DownloaderService } from '../downloader/downloader.service';

@Injectable()
export class StreamService {
  constructor(private readonly downloaderService: DownloaderService) {}
}
