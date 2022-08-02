import { Module } from "@nestjs/common"
import { LobbyModule } from "src/core/lobby/lobby.module"
import { DownloaderModule } from "../downloader/downloader.module"
import { StreamGateway } from "./stream.gateway"
import { StreamService } from "./stream.service"

@Module({
    imports: [DownloaderModule, LobbyModule],
    controllers: [],
    providers: [StreamGateway, StreamService],
    exports: [StreamService],
})
export class StreamModule {}
