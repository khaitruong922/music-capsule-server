import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { filterChat } from "src/common/utils/string"
import { LobbyService } from "../lobby/lobby.service"
import { StreamService } from "../stream/stream.service"
import { CHAT, INVALID_COMMAND, USER_CHAT } from "./chat.event"
import { ChatDto, InvalidCommand, MessageDto } from "./chat.interface"
import { ChatService } from "./chat.service"

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class ChatGateway {
    @WebSocketServer()
    io: Server
    constructor(
        private readonly chatService: ChatService,
        private readonly lobbyService: LobbyService,
        private readonly streamService: StreamService,
    ) {}

    @SubscribeMessage(CHAT)
    chat(@ConnectedSocket() socket: Socket, @MessageBody() dto: ChatDto) {
        const { id: socketId } = socket
        const { content } = dto
        const user = this.lobbyService.getUser(socketId)
        const { roomId } = user
        let message: MessageDto = { type: "message", content }
        try {
            message = this.chatService.parseMessage(content)
        } catch (e) {
            if (e instanceof InvalidCommand) {
                socket.emit(INVALID_COMMAND, { message: e.message })
            }
            return
        }
        if (message.type === "message") {
            this.io
                .to(roomId)
                .emit(USER_CHAT, { user, content: filterChat(content) })
            return
        }
        if (message.type === "ff") {
            const roomId = this.lobbyService.getUserCurrentRoomId(socketId)
            const { seconds } = message
            try {
                this.streamService.fastForward({ roomId, seconds, socketId })
            } catch (e) {
                if (e instanceof InvalidCommand) {
                    socket.emit(INVALID_COMMAND, { message: e.message })
                }
            }
        }
    }
}
