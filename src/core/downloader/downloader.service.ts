import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
} from "@nestjs/common"
import fs from "fs"
import path from "path"
import { execAsync } from "src/common/utils/child_process"
import {
    buildPitchAndTempoString,
    getAudioLengthInSeconds,
    getAudioSampleRate,
} from "src/common/utils/ffmpeg"
import {
    getExtensionFromFormat,
    getMp3FilePath,
    getMp3FolderPath,
} from "src/common/utils/file"
import { isValidHttpUrl } from "src/common/utils/url"
import * as yt from "youtube-search-without-api-key"
import ytdl from "ytdl-core"
import {
    CreateDownloaderDto,
    DownloadVideoData,
    ModifyPitchAndTempoDto,
} from "./downloader.interface"

@Injectable()
export class DownloaderService implements OnModuleInit {
    idToTitle = {}

    onModuleInit() {
        const mp3FolderPath = getMp3FolderPath()
        if (fs.existsSync(mp3FolderPath)) {
            fs.rmSync(mp3FolderPath, { recursive: true })
        }
    }
    async download(dto: CreateDownloaderDto) {
        const { format } = dto
        let { url, semitoneShift = 0, playbackSpeed = 1 } = dto
        semitoneShift = Math.max(Math.min(semitoneShift, 12), -12)
        playbackSpeed = Math.max(Math.min(playbackSpeed, 2), 0.5)
        url = url.trim()
        // Check if input is not URL, then we search and get first result
        if (!isValidHttpUrl(url)) {
            url = await this.searchAndGetFirstUrl(url)
        }

        if (!url) {
            throw new NotFoundException(
                `There is no video for search query: ${url}`,
            )
        }

        const videoData = await this.getVideoData(url)
        const { id, title } = videoData
        this.idToTitle[id] = title

        const downloader = await this.createDownloader({ ...dto, url })

        const ext = getExtensionFromFormat(format)
        let fileName = `${id}${ext}`
        let filePath = getMp3FilePath(fileName)

        if (!fs.existsSync(filePath)) {
            console.log("Downloading...")
            const stream = await this.createWriteStream(filePath)
            const pipeStream = downloader.pipe(stream)
            await new Promise((resolve) => pipeStream.on("finish", resolve))
        }

        const modified = semitoneShift !== 0 || playbackSpeed !== 1
        if (modified) {
            const modifiedFileName = this.getModifiedFileName(
                id,
                semitoneShift,
                playbackSpeed,
                ext,
            )
            const modifiedFilePath = getMp3FilePath(modifiedFileName)

            if (!fs.existsSync(modifiedFilePath)) {
                console.log("Modifying audio...")
                await this.modifyPitchAndTempo({
                    playbackSpeed,
                    semitoneShift,
                    filePath,
                })
            }
            fileName = modifiedFileName
            videoData.title = `${videoData.title} ${buildPitchAndTempoString(
                semitoneShift,
                playbackSpeed,
            )}`
            videoData.length = await getAudioLengthInSeconds(modifiedFilePath)
        }

        return { fileName, videoData, url }
    }

    async createDownloader(dto: CreateDownloaderDto) {
        const { url, format } = dto
        return ytdl(url, {
            filter: format,
        })
    }

    async modifyPitchAndTempo(dto: ModifyPitchAndTempoDto) {
        const { playbackSpeed, semitoneShift, filePath } = dto
        const { dir, name, ext } = path.parse(filePath)
        const outputFileName = this.getModifiedFileName(
            name,
            semitoneShift,
            playbackSpeed,
            ext,
        )
        const outputFilePath = path.join(dir, outputFileName)
        const SAMPLE_RATE = await getAudioSampleRate(filePath)
        const modifier = Math.pow(2, semitoneShift / 12)
        const hz = SAMPLE_RATE * modifier
        const tempo = playbackSpeed / modifier
        const command = `ffmpeg -y -i "${filePath}" -af asetrate=${hz},aresample=${SAMPLE_RATE},atempo=${tempo} ${outputFilePath}`
        await execAsync(command)
    }

    getModifiedFileName(
        name: string,
        semitoneShift: number,
        playbackSpeed: number,
        ext: string,
    ): string {
        return `${name}_${semitoneShift}_x${playbackSpeed}${ext}`
    }

    getTitleFileName(filePath: string): string {
        const parsedPath = path.parse(filePath)
        const parts = parsedPath.name.split("_")
        const id = parts[0]
        const title = this.idToTitle[id]
        let fileName = title
        if (parts[1] && parts[2]) {
            const semitoneShift = Number(parts[1])
            const tempo = Number(parts[2].substring(1))
            fileName += ` ${buildPitchAndTempoString(semitoneShift, tempo)}`
        }
        fileName += parsedPath.ext
        return fileName
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
        const MAX_MINUTES = 60
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

    private async createWriteStream(filePath: string): Promise<fs.WriteStream> {
        const writePath = getMp3FolderPath()
        if (!fs.existsSync(writePath)) {
            fs.mkdirSync(writePath, { recursive: true })
        }
        return fs.createWriteStream(filePath)
    }

    private async searchAndGetFirstUrl(q: string): Promise<string> {
        const videos = await yt.search(q)
        const video = videos[0]
        if (!video) return null
        const videoId = video.id.videoId
        return `https://youtu.be/${videoId}`
    }
}
