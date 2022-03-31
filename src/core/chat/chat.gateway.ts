import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { filterChat } from 'src/common/utils/string'
import { LobbyService } from '../lobby/lobby.service'
import { CHAT, USER_CHAT } from './chat.event'
import { ChatDto } from './chat.interface'
import { ChatService } from './chat.service'

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class ChatGateway {
    @WebSocketServer()
    io: Server
    constructor(
        private readonly chatService: ChatService,
        private readonly lobbyService: LobbyService,
    ) {}

    @SubscribeMessage(CHAT)
    chat(@ConnectedSocket() socket: Socket, @MessageBody() dto: ChatDto) {
        const { id: socketId } = socket
        const { content } = dto
        const user = this.lobbyService.getUser(socketId)
        const { roomId } = user
        this.io
            .to(roomId)
            .emit(USER_CHAT, { user, content: filterChat(content) })
    }
}
