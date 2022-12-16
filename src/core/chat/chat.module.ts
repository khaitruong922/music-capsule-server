import { Module } from "@nestjs/common"
import { LobbyModule } from "../lobby/lobby.module"
import { StreamModule } from "../stream/stream.module"
import { ChatGateway } from "./chat.gateway"
import { ChatService } from "./chat.service"

@Module({
    imports: [LobbyModule, StreamModule],
    providers: [ChatGateway, ChatService],
    exports: [ChatService],
})
export class ChatModule {}
