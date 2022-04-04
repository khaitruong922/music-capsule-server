import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common'
import { Response } from 'express'
import { getMp3FilePath } from 'src/common/utils/file'
import { DownloadByFileNameDto, DownloadByUrlDto } from './downloader.interface'
import { DownloaderService } from './downloader.service'
import fs from 'fs/promises'
@Controller('/download')
export class DownloaderController {
    constructor(private readonly downloaderService: DownloaderService) {}

    @Get('mp3/:fileName')
    async downloadFile(
        @Res() res: Response,
        @Param('fileName') fileName: string,
    ) {
        const filePath = getMp3FilePath(fileName)
        res.download(filePath)
    }

    @Post('mp3')
    async downloadMp3(@Res() res: Response, @Body() dto: DownloadByUrlDto) {
        const { url } = dto
        const downloader = await this.downloaderService.createDownloader({
            url,
            format: 'audioonly',
        })
        const { id, title } = await this.downloaderService.getVideoData(url)
        res.set({
            'Content-Disposition': `attachment; filename=${id}.mp3`,
        })
        downloader.pipe(res)
    }

    @Post('mp4')
    async downloadMp4(@Res() res: Response, @Body() dto: DownloadByUrlDto) {
        const { url } = dto
        const downloader = await this.downloaderService.createDownloader({
            url,
            format: 'videoandaudio',
        })
        const { id, title } = await this.downloaderService.getVideoData(url)

        res.set({
            'Content-Disposition': `attachment; filename=${id}.mp4`,
        })
        downloader.pipe(res)
    }

    @Post('mp3/disk')
    async downloadMp3ToDisk(@Body() dto: DownloadByUrlDto) {
        const { url } = dto
        return this.downloaderService.download({
            url,
            format: 'audioonly',
        })
    }
}
