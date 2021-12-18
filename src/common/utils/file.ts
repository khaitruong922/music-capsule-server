import { DownloadFileExtension } from 'src/core/downloader/downloader.interface';
import ytdl from 'ytdl-core';
import fs, { WriteStream } from 'fs';

export function getExtensionFromFormat(
  format: ytdl.Filter,
): DownloadFileExtension {
  if (format === 'videoandaudio') return 'mp4';
  if (format === 'audioonly') return 'mp3';
  return null;
}

export async function createWriteStreamAsync(
  path: string,
): Promise<WriteStream> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(path);
    writeStream
      .on('finish', () => {
        resolve(writeStream);
      })
      .on('error', reject);
  });
}

export function removeForwardSlashes(s: string) {
  return s.replace(/\/+/, '');
}
