import { Module } from '@nestjs/common';
import { DownloaderService } from './downloader.service';
import { DownloaderController } from './downloader.controller';

@Module({
  controllers: [DownloaderController],
  providers: [DownloaderService],
  exports: [DownloaderService],
})
export class DownloaderModule {}
