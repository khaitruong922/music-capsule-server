import { Module } from "@nestjs/common"
import { ChatService } from "./chat.service"
import { ChatGateway } from "./chat.gateway"
import { LobbyModule } from "../lobby/lobby.module"
import { StreamModule } from "../stream/stream.module"

@Module({
    imports: [LobbyModule, StreamModule],
    providers: [ChatGateway, ChatService],
    exports: [ChatService],
})
export class ChatModule {}
