import { Controller, Get, Param, Res } from "@nestjs/common"
import { Response } from "express"
import { getMp3FilePath } from "src/common/utils/file"
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
        res.download(
            filePath,
            this.downloaderService.getTitleFileName(filePath),
        )
    }
}
