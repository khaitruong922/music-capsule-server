import { HttpService } from '@nestjs/axios'
import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fs from 'fs'
import path from 'path'
import { execAsync } from 'src/common/utils/child_process'
import {
    buildPitchAndTempoString,
    getAudioLengthInSeconds,
    getAudioSampleRate,
} from 'src/common/utils/ffmpeg'
import {
    getExtensionFromFormat,
    getMp3FilePath,
    getMp3FolderPath,
} from 'src/common/utils/file'
import { isValidHttpUrl } from 'src/common/utils/url'
import * as yt from 'youtube-search-without-api-key'
import ytdl from 'ytdl-core'
import {
    CreateDownloaderDto,
    DownloadVideoData,
    ModifyPitchAndTempoDto,
} from './downloader.interface'

@Injectable()
export class DownloaderService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}

    async saveToDisk(dto: CreateDownloaderDto) {
        const { format } = dto
        let { url, semitoneShift = 0, playbackSpeed = 1 } = dto
        url = url.trim()
        // Check if input is not URL, then we search and get first result
        if (!isValidHttpUrl(url)) {
            try {
                url = await this.searchAndGetFirstUrl(url)
            } catch (e) {
                throw new ForbiddenException(
                    'Search limit exceeded. Please insert YouTube URL instead.',
                )
            }
            if (!url)
                throw new NotFoundException(
                    `There is no video for search query: ${url}`,
                )
        }
        const videoData = await this.getVideoData(url)
        const { id } = videoData
        const downloader = await this.createDownloader({ ...dto, url })
        const ext = getExtensionFromFormat(format)
        const stream = await this.createWriteStream(id, ext)
        const pipeStream = downloader.pipe(stream)
        await new Promise((resolve) => pipeStream.on('finish', resolve))
        console.log(videoData)

        const filePath = stream.path as string
        let fileName = path.basename(filePath)

        // Modify pitch and playbackSpeed if it is not original value
        if (semitoneShift !== 0 || playbackSpeed !== 1) {
            const outputFilePath = await this.modifyPitchAndTempo({
                playbackSpeed,
                semitoneShift,
                filePath,
            })
            fileName = path.basename(outputFilePath)
            videoData.title = `${videoData.title} ${buildPitchAndTempoString(
                semitoneShift,
                playbackSpeed,
            )}`
            videoData.length = await getAudioLengthInSeconds(outputFilePath)
        }
        return { fileName, videoData }
    }

    async createDownloader(dto: CreateDownloaderDto) {
        const { url, format } = dto
        return ytdl(url, {
            filter: format,
        })
    }

    async modifyPitchAndTempo(dto: ModifyPitchAndTempoDto): Promise<string> {
        const { playbackSpeed, semitoneShift, filePath } = dto
        const { dir, name, ext } = path.parse(filePath)
        const outputFileName = `${name}_${semitoneShift}_x${playbackSpeed}${ext}`
        const outputFilePath = path.join(dir, outputFileName)
        const SAMPLE_RATE = await getAudioSampleRate(filePath)
        const modifier = Math.pow(2, semitoneShift / 12)
        const hz = SAMPLE_RATE * modifier
        const tempo = playbackSpeed / modifier
        console.log(hz)
        const command = `ffmpeg -y -i ${filePath} -af asetrate=${hz},aresample=${SAMPLE_RATE},atempo=${tempo} ${outputFilePath}`
        await execAsync(command)
        console.log(command)
        return outputFilePath
    }

    async getVideoData(url: string): Promise<DownloadVideoData> {
        let videoInfo: ytdl.videoInfo
        try {
            videoInfo = await ytdl.getBasicInfo(url)
        } catch (e: unknown) {
            console.log(e)
            if (e instanceof Error)
                throw new InternalServerErrorException(e.message)
        }
        const {
            player_response: {
                videoDetails: {
                    author,
                    videoId,
                    title,
                    lengthSeconds,
                    thumbnail: { thumbnails },
                },
            },
        } = videoInfo

        const length = Number(lengthSeconds)
        const MAX_MINUTES = 30
        if (length > MAX_MINUTES * 60)
            throw new InternalServerErrorException(
                `Video length cannot be longer than ${MAX_MINUTES} minutes`,
            )
        return {
            id: videoId,
            author,
            title,
            length,
            thumbnailUrl: thumbnails[thumbnails.length - 1]?.url,
        }
    }

    private async createWriteStream(fileName: string, ext: string) {
        if (!ext)
            throw new InternalServerErrorException('Invalid file extension!')
        const writePath = getMp3FolderPath()
        if (!fs.existsSync(writePath)) {
            fs.mkdirSync(writePath, { recursive: true })
        }
        fileName = `${fileName}-${new Date().getTime()}.${ext}`
        const fullPath = getMp3FilePath(fileName)
        return fs.createWriteStream(fullPath)
    }
    private async searchAndGetFirstUrl(q: string) {
        const videos = await yt.search(q)
        const video = videos[0]
        if (!video) return null
        console.log(video)
        const videoId = video.id.videoId
        return `https://youtu.be/${videoId}`
    }
}
