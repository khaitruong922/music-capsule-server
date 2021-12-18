import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import ytdl from 'ytdl-core';
import { DownloadRequestBodyDto } from './downloader.interface';
import { DownloaderService } from './downloader.service';

@Controller('/download')
export class DownloaderController {
  constructor(private readonly downloaderService: DownloaderService) {}

  @Post('mp3')
  async downloadMp3(@Res() res: Response, @Body() dto: DownloadRequestBodyDto) {
    const { url } = dto;
    const downloader = await this.downloaderService.createDownloader({
      url,
      format: 'audioonly',
    });
    const { id, title } = await this.downloaderService.getVideoData(url);
    res.set({
      'Content-Disposition': `attachment; filename=${id}.mp3`,
    });
    downloader.pipe(res);
  }

  @Post('mp4')
  async downloadMp4(@Res() res: Response, @Body() dto: DownloadRequestBodyDto) {
    const { url } = dto;
    const downloader = await this.downloaderService.createDownloader({
      url,
      format: 'videoandaudio',
    });
    const { id, title } = await this.downloaderService.getVideoData(url);

    res.set({
      'Content-Disposition': `attachment; filename=${id}.mp4`,
    });
    downloader.pipe(res);
  }

  @Post('mp3/disk')
  async downloadMp3ToDisk(@Body() dto: DownloadRequestBodyDto) {
    const { url } = dto;
    return this.downloaderService.downloadToDisk({
      url,
      format: 'audioonly',
    });
  }
}
