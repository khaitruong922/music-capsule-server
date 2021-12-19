import { Injectable, InternalServerErrorException } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import {
  getExtensionFromFormat,
  getMp3FilePath,
  getMp3FolderPath,
  removeForwardSlashes,
} from 'src/common/utils/file';
import ytdl from 'ytdl-core';
import { CreateDownloaderDto, DownloadVideoData } from './downloader.interface';

@Injectable()
export class DownloaderService {
  constructor() {}

  async saveToDisk(dto: CreateDownloaderDto) {
    const { url, format } = dto;
    const { title } = await this.getVideoData(url);
    const downloader = await this.createDownloader(dto);
    const ext = getExtensionFromFormat(format);
    const stream = await this.createWriteStream(title, ext);
    downloader.pipe(stream);

    const fileName = path.basename(stream.path as string);
    return { fileName };
  }

  async createDownloader(dto: CreateDownloaderDto) {
    const { url, format } = dto;
    return ytdl(url, {
      filter: format,
    });
  }

  async getVideoData(url: string): Promise<DownloadVideoData> {
    try {
      const {
        player_response: {
          videoDetails: { title, author, videoId },
        },
      } = await ytdl.getBasicInfo(url);
      return {
        id: videoId,
        author,
        title,
      };
    } catch (e) {
      throw new InternalServerErrorException('Invalid YouTube URL!');
    }
  }

  private async createWriteStream(fileName: string, ext: string) {
    if (!ext) throw new InternalServerErrorException('Invalid file extension!');
    const writePath = getMp3FolderPath();
    if (!fs.existsSync(writePath)) {
      fs.mkdirSync(writePath, { recursive: true });
    }
    fileName = `${fileName}-${new Date().getTime()}.${ext}`;
    fileName = removeForwardSlashes(fileName);
    const fullPath = getMp3FilePath(fileName);
    return fs.createWriteStream(fullPath);
  }
}
