import { Module } from '@nestjs/common'
import { DownloaderService } from './downloader.service'
import { DownloaderController } from './downloader.controller'
import { HttpModule } from '@nestjs/axios'

@Module({
    controllers: [DownloaderController],
    providers: [DownloaderService],
    exports: [DownloaderService],
})
export class DownloaderModule {}
