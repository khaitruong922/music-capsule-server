import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common"
import { Response } from "express"
import { getMp3FilePath } from "src/common/utils/file"
import { DownloadByUrlDto } from "./downloader.interface"
import { DownloaderService } from "./downloader.service"
@Controller("/download")
export class DownloaderController {
    constructor(private readonly downloaderService: DownloaderService) {}

    @Get("mp3/:fileName")
    async downloadFile(
        @Res() res: Response,
        @Param("fileName") fileName: string,
    ) {
        const filePath = getMp3FilePath(fileName)
        const ext = filePath.split(".").pop()
        res.download(filePath)
    }
}
