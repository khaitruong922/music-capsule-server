import path from 'path'
import sanitize from 'sanitize-filename'
import { DownloadFileExtension } from 'src/core/downloader/downloader.interface'
import ytdl from 'ytdl-core'

export function getExtensionFromFormat(format: ytdl.Filter): string {
    if (format === 'videoandaudio') return '.mp4'
    if (format === 'audioonly') return '.mp3'
    return null
}

export function getMp3FolderPath() {
    return path.join(process.cwd(), 'public', 'mp3')
}

export function getMp3FilePath(filename: string) {
    filename = sanitize(filename)
    return path.join(getMp3FolderPath(), filename)
}
