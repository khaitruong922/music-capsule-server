import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ChatModule } from "./core/chat/chat.module"
import { DownloaderModule } from "./core/downloader/downloader.module"
import { LobbyModule } from "./core/lobby/lobby.module"
import { StreamModule } from "./core/stream/stream.module"

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DownloaderModule,
        StreamModule,
        LobbyModule,
        ChatModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
