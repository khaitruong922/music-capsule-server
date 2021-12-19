import path from 'path';
import { DownloadFileExtension } from 'src/core/downloader/downloader.interface';
import ytdl from 'ytdl-core';

export function getExtensionFromFormat(
  format: ytdl.Filter,
): DownloadFileExtension {
  if (format === 'videoandaudio') return 'mp4';
  if (format === 'audioonly') return 'mp3';
  return null;
}

export function removeForwardSlashes(s: string) {
  return s.replace(/\/+/, '');
}

export function getMp3FolderPath() {
  return path.join(process.cwd(), 'public', 'mp3');
}

export function getMp3FilePath(filename: string) {
  filename = removeForwardSlashes(filename);
  return path.join(getMp3FolderPath(), filename);
}
