import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { lobbyRoomResponse } from 'src/common/utils/room'
import { filterName } from 'src/common/utils/string'
import {
    CREATE_ROOM,
    JOIN_CREATED_ROOM,
    JOIN_LOBBY,
    JOIN_ROOM,
    LEAVE_ROOM,
    LOBBY_JOINED,
    ROOM_CREATED,
    ROOM_DELETED,
    ROOM_USER_COUNT_CHANGED,
    USER_JOIN_ROOM,
    USER_LEAVE_ROOM,
} from './lobby.event'
import {
    CreateRoomMessageDto,
    JoinLobbyMessageDto,
    JoinRoomMessageDto,
    LeaveRoomMessageDto,
    RoomResponse,
} from './lobby.interface'
import { LobbyService } from './lobby.service'

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private io: Server

    constructor(private readonly lobbyService: LobbyService) {}

    @SubscribeMessage(JOIN_LOBBY)
    joinLobby(
        @ConnectedSocket() socket: Socket,
        @MessageBody() dto: JoinLobbyMessageDto,
    ) {
        const { id: socketId } = socket
        this.lobbyService.joinLobby({ ...dto, socketId })
        socket.emit(LOBBY_JOINED)
    }

    @SubscribeMessage(CREATE_ROOM)
    createRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() dto: CreateRoomMessageDto,
    ) {
        const room = this.lobbyService.createRoom({ ...dto })

        this.io.emit(ROOM_CREATED, { room: lobbyRoomResponse(room) })
        socket.emit(JOIN_CREATED_ROOM, { roomId: room.id })
    }

    @SubscribeMessage(JOIN_ROOM)
    async joinRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() dto: JoinRoomMessageDto,
    ) {
        const { id: socketId } = socket
        const { roomId } = dto
        const { user } = this.lobbyService.joinRoom({ roomId, socketId })

        socket.join(roomId)
        this.io.to(roomId).emit(USER_JOIN_ROOM, { user })
        this.updateRoomUserCount(roomId)
    }

    @SubscribeMessage(LEAVE_ROOM)
    leaveRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() dto: LeaveRoomMessageDto,
    ) {
        const { roomId, user } = dto
        const { id: socketId } = socket
        this.lobbyService.leaveRoom({
            ...dto,
            socketId,
        })
        this.io.to(roomId).emit(USER_LEAVE_ROOM, { user })
        socket.leave(roomId)
        this.updateRoomUserCount(roomId)
    }

    updateRoomUserCount(roomId: string) {
        const room = this.lobbyService.getRoom(roomId)
        const userCount = Object.keys(room.users).length
        this.io.emit(ROOM_USER_COUNT_CHANGED, { roomId, userCount })
    }

    handleConnection(@ConnectedSocket() socket: Socket) {
        console.log(`Socket ${socket.id} connected!`)
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        const { id: socketId } = socket
        try {
            const { leaveRoomId, leaveUser } = this.lobbyService.leaveLobby({
                socketId,
            })
            if (leaveRoomId)
                this.leaveRoom(socket, { roomId: leaveRoomId, user: leaveUser })
        } catch (e) {
            console.log(e)
        }
        console.log(`Socket ${socketId} disconnected!`)
    }
}
