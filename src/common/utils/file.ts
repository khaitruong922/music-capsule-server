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
