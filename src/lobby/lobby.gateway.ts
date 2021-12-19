import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  CREATE_ROOM,
  JOIN_CREATED_ROOM,
  JOIN_LOBBY,
  JOIN_ROOM,
  LEAVE_ROOM,
  LOBBY_JOINED,
  ROOM_CREATED,
  ROOM_DELETED,
  USER_JOIN_ROOM,
  USER_LEAVE_ROOM,
} from './lobby.event';
import {
  CreateRoomMessageDto,
  JoinLobbyMessageDto,
  JoinRoomMessageDto,
  LeaveRoomMessageDto,
} from './lobby.interface';
import { LobbyService } from './lobby.service';

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private io: Server;

  constructor(private readonly lobbyService: LobbyService) {}

  @SubscribeMessage(JOIN_LOBBY)
  async joinLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: JoinLobbyMessageDto,
  ) {
    const { id: socketId } = socket;
    await this.lobbyService.joinLobby({ ...dto, socketId });
    socket.emit(LOBBY_JOINED);
  }

  @SubscribeMessage(CREATE_ROOM)
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: CreateRoomMessageDto,
  ) {
    const { id: socketId } = socket;
    const room = await this.lobbyService.createRoom({ ...dto, socketId });
    this.io.emit(ROOM_CREATED, { room });
    socket.emit(JOIN_CREATED_ROOM, { roomId: room.id });
  }

  @SubscribeMessage(JOIN_ROOM)
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: JoinRoomMessageDto,
  ) {
    const { id: socketId } = socket;
    const { roomId } = dto;
    const { user } = await this.lobbyService.joinRoom({ roomId, socketId });

    socket.join(roomId);
    socket.to(roomId).emit(USER_JOIN_ROOM, { user });
  }

  @SubscribeMessage(LEAVE_ROOM)
  async leaveRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: LeaveRoomMessageDto,
  ) {
    const { roomId } = dto;
    const { id: socketId } = socket;
    const { shouldDeleteRoom } = await this.lobbyService.leaveRoom({
      ...dto,
      socketId,
    });
    socket.to(roomId).emit(USER_LEAVE_ROOM, { socketId });
    if (shouldDeleteRoom) this.io.emit(ROOM_DELETED, { roomId });
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(`Socket ${socket.id} connected!`);
  }
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { id: socketId } = socket;
    const { leaveRoomId } = await this.lobbyService.leaveLobby({ socketId });
    if (leaveRoomId) socket.to(leaveRoomId).emit(USER_LEAVE_ROOM, { socketId });
    console.log(`Socket ${socketId} disconnected!`);
  }
}
