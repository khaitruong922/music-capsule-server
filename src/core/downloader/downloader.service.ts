import { Injectable, InternalServerErrorException } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import {
  getExtensionFromFormat,
  getMp3FilePath,
  getMp3FolderPath,
} from 'src/common/utils/file';
import ytdl from 'ytdl-core';
import { CreateDownloaderDto, DownloadVideoData } from './downloader.interface';

@Injectable()
export class DownloaderService {
  constructor() {}

  async saveToDisk(dto: CreateDownloaderDto) {
    const { url, format } = dto;
    const videoData = await this.getVideoData(url);
    const { id } = videoData;
    const downloader = await this.createDownloader(dto);
    const ext = getExtensionFromFormat(format);
    const stream = await this.createWriteStream(id, ext);
    const pipeStream = downloader.pipe(stream);
    await new Promise((resolve) => pipeStream.on('finish', resolve));

    const fileName = path.basename(stream.path as string);
    return { fileName, videoData };
  }

  async createDownloader(dto: CreateDownloaderDto) {
    const { url, format } = dto;
    return ytdl(url, {
      filter: format,
    });
  }

  async getVideoData(url: string): Promise<DownloadVideoData> {
    let videoInfo: ytdl.videoInfo;
    try {
      videoInfo = await ytdl.getBasicInfo(url);
    } catch (e) {
      throw new InternalServerErrorException('Invalid YouTube URL!');
    }
    const {
      player_response: {
        videoDetails: { author, videoId, title, lengthSeconds },
      },
    } = videoInfo;

    const length = Number(lengthSeconds);
    const MAX_MINUTES = 15;
    if (length > MAX_MINUTES * 60)
      throw new InternalServerErrorException(
        `Video length cannot be longer than ${MAX_MINUTES} minutes`,
      );
    return {
      id: videoId,
      author,
      title,
      length,
    };
  }

  private async createWriteStream(fileName: string, ext: string) {
    if (!ext) throw new InternalServerErrorException('Invalid file extension!');
    const writePath = getMp3FolderPath();
    if (!fs.existsSync(writePath)) {
      fs.mkdirSync(writePath, { recursive: true });
    }
    fileName = `${fileName}-${new Date().getTime()}.${ext}`;
    const fullPath = getMp3FilePath(fileName);
    return fs.createWriteStream(fullPath);
  }
}
