import ytdl from 'ytdl-core';

export interface DownloadRequestBodyDto {
  url: string;
}

export interface CreateDownloaderDto {
  url: string;
  format: ytdl.Filter;
}

export interface DownloadVideoData {
  id: string;
  title: string;
  author: string;
  length: number;
}

export type DownloadFileExtension = 'mp3' | 'mp4';
