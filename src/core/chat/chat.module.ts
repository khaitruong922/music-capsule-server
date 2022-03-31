import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { LobbyModule } from '../lobby/lobby.module'

@Module({
    imports: [LobbyModule],
    providers: [ChatGateway, ChatService],
    exports: [ChatService],
})
export class ChatModule {}
