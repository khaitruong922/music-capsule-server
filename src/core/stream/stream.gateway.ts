import { HttpException } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from "@nestjs/websockets"
import { Server, Socket } from "socket.io"
import { LobbyService } from "src/core/lobby/lobby.service"
import {
    ADD_SONG,
    ADD_SONG_FAILED,
    ADD_SONG_SUCCESS,
    FAST_FORWARD,
    NEXT_SONG,
    ROOM_SONG_CHANGED,
    SKIP,
    SONG_ADDED,
} from "./stream.event"
import {
    AddSongMessageDto,
    FastForwardPayload,
    NextSongEventPayload,
    RoomSongChangedEventPayload,
} from "./stream.interface"
import { StreamService } from "./stream.service"

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class StreamGateway {
    @WebSocketServer()
    io: Server

    constructor(
        private readonly streamService: StreamService,
        private readonly lobbyService: LobbyService,
    ) {}

    @SubscribeMessage(ADD_SONG)
    async addSong(
        @ConnectedSocket() socket: Socket,
        @MessageBody() dto: AddSongMessageDto,
    ) {
        try {
            const { id: socketId } = socket
            const { name: username } = this.lobbyService.getUser(socketId)
            const roomId = this.lobbyService.getUserCurrentRoomId(socketId)
            const { song } = await this.streamService.addSong({
                ...dto,
                roomId,
            })
            this.io.to(roomId).emit(SONG_ADDED, { song, username })
            socket.emit(ADD_SONG_SUCCESS, { song })
        } catch (e) {
            console.log(e)
            let message = "An exception occured!"
            if (e instanceof HttpException) {
                message = e.message
            }
            socket.emit(ADD_SONG_FAILED, { message })
        }
    }

    @OnEvent(NEXT_SONG)
    nextSong(payload: NextSongEventPayload) {
        const { roomId } = payload
        this.io.to(roomId).emit(NEXT_SONG)
    }

    @OnEvent(ROOM_SONG_CHANGED)
    roomSongChanged(payload: RoomSongChangedEventPayload) {
        this.io.emit(ROOM_SONG_CHANGED, payload)
    }

    @OnEvent(FAST_FORWARD)
    fastForward(payload: FastForwardPayload) {
        const { roomId, song, username, seconds } = payload
        this.io.to(roomId).emit(FAST_FORWARD, { song, username, seconds })
    }

    @SubscribeMessage(SKIP)
    skip(@ConnectedSocket() socket: Socket) {
        const { id: socketId } = socket
        const roomId = this.lobbyService.getUserCurrentRoomId(socketId)
        const username = this.lobbyService.getUser(socketId)?.name
        const title = this.lobbyService.getRoom(roomId)?.queue[0]?.title
        this.streamService.skip(roomId)
        this.io.to(roomId).emit(SKIP, {
            username,
            title,
        })
    }
}
