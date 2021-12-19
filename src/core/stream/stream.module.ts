import { Module } from '@nestjs/common';
import { DownloaderModule } from '../downloader/downloader.module';
import { StreamController } from './stream.controller';
import { StreamGateway } from './stream.gateway';
import { StreamService } from './stream.service';

@Module({
  imports: [DownloaderModule],
  controllers: [StreamController],
  providers: [StreamGateway, StreamService],
  exports: [StreamService],
})
export class StreamModule {}
