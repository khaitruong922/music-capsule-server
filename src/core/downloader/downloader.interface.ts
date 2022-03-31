import ytdl from 'ytdl-core'

export interface DownloadByFileNameDto {
    fileName: string
}
export interface DownloadByUrlDto {
    url: string
}

export interface CreateDownloaderDto {
    url: string
    format: ytdl.Filter
    semitoneShift?: number
    playbackSpeed?: number
}

export interface ModifyPitchAndTempoDto {
    semitoneShift: number
    playbackSpeed: number
    filePath: string
}
export interface DownloadVideoData {
    id: string
    title: string
    author: string
    length: number
    thumbnailUrl: string
}

export type DownloadFileExtension = 'mp3' | 'mp4'
