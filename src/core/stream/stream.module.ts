import { Module } from '@nestjs/common';
import { DownloaderModule } from '../downloader/downloader.module';
import { StreamGateway } from './stream.gateway';
import { StreamService } from './stream.service';

@Module({
  imports: [DownloaderModule],
  providers: [StreamGateway, StreamService],
})
export class StreamModule {}
