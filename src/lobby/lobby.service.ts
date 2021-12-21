import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateRoomId } from 'src/common/utils/id';
import { lobbyRoomResponse } from 'src/common/utils/room';
import { ROOM_DELETED } from './lobby.event';
import {
  CreateRoomDto,
  JoinLobbyDto,
  JoinRoomDto,
  LeaveLobbyDto,
  LeaveRoomDto,
  Lobby,
  LobbyResponse,
  LobbyRoomsResponse,
  RoomResponse,
  RoomWithUsers,
} from './lobby.interface';

@Injectable()
export class LobbyService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  lobby: Lobby = {
    rooms: {},
    users: {},
  };

  joinLobby(dto: JoinLobbyDto) {
    const { user, socketId } = dto;
    // Already join lobby
    if (this.lobby.users[socketId]) return;
    this.lobby.users[socketId] = { ...user, socketId, roomId: null };
    console.log(`${socketId} has joined the lobby!`);
  }

  leaveLobby(dto: LeaveLobbyDto) {
    const { socketId } = dto;
    const { roomId } = { ...this.lobby.users[socketId] };
    if (roomId) this.leaveRoom({ roomId, socketId });
    delete this.lobby.users[socketId];
    console.log(`${socketId} has left the lobby!`);
    return { leaveRoomId: roomId };
  }

  createRoom(dto: CreateRoomDto) {
    const roomId = generateRoomId();
    const { roomName, socketId } = dto;
    const room: RoomWithUsers = {
      id: roomId,
      name: roomName,
      users: {},
      queue: [],
    };
    this.lobby.rooms[roomId] = room;
    return room;
  }

  joinRoom(dto: JoinRoomDto) {
    const { roomId, socketId } = dto;
    const userWithRoom = this.getUser(socketId);
    const room = this.getRoom(roomId);
    const { roomId: _, ...user } = userWithRoom;
    room.users[socketId] = user;
    this.lobby.users[socketId].roomId = roomId;

    console.log(`${socketId} has joined room ${roomId}!`);
    return { user };
  }

  leaveRoom(dto: LeaveRoomDto) {
    const { users, rooms } = this.lobby;
    const { roomId, socketId } = dto;
    const room = this.getRoom(roomId);
    const { timeout } = room;
    delete room.users[socketId];
    users[socketId].roomId = null;

    const shouldDeleteRoom = Object.keys(room.users).length === 0;
    if (shouldDeleteRoom) {
      this.eventEmitter.emit(ROOM_DELETED, { roomId });
      clearTimeout(timeout);
      delete rooms[roomId];
    }

    console.log(`${socketId} has left room ${roomId}!`);
    return { shouldDeleteRoom };
  }

  getRooms() {
    return this.lobby.rooms;
  }

  getUsers() {
    return this.lobby.users;
  }

  getRoom(id: string) {
    const { rooms } = this.lobby;
    if (!rooms[id]) throw new NotFoundException(`Room not found: ${id}`);
    return rooms[id];
  }

  getUser(socketId: string) {
    const { users } = this.lobby;
    if (!users[socketId])
      throw new NotFoundException(`User not found: ${socketId}`);
    return users[socketId];
  }

  getUserCurrentRoomId(socketId: string) {
    const user = this.getUser(socketId);
    return user.roomId;
  }

  getLobbyResponse(): LobbyResponse {
    const lobbyRoomsResponse: LobbyRoomsResponse = {};
    for (const roomId in this.lobby.rooms) {
      const room = this.lobby.rooms[roomId];
      lobbyRoomsResponse[roomId] = lobbyRoomResponse(room);
    }
    return {
      rooms: lobbyRoomsResponse,
    };
  }

  getRoomResponse(roomId: string): RoomResponse {
    const room = this.getRoom(roomId);
    const { id, name, queue, users } = room;
    const roomResponse: RoomResponse = { id, name, queue, users };
    return roomResponse;
  }
}
