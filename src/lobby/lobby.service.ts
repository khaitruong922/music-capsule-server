import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateRoomId } from 'src/common/utils/id';
import { ROOM_DELETED } from './lobby.event';
import {
  CreateRoomDto,
  JoinLobbyDto,
  JoinRoomDto,
  LeaveLobbyDto,
  LeaveRoomDto,
  Lobby,
  RoomWithUsers,
} from './lobby.interface';

@Injectable()
export class LobbyService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  private lobby: Lobby = {
    rooms: {},
    users: {},
  };

  async joinLobby(dto: JoinLobbyDto) {
    const { user, socketId } = dto;
    // Already join lobby
    if (this.lobby.users[socketId]) return;
    this.lobby.users[socketId] = { ...user, socketId, roomId: null };
    console.log(`${socketId} has joined the lobby!`);
  }

  async leaveLobby(dto: LeaveLobbyDto) {
    const { socketId } = dto;
    const { roomId } = { ...this.lobby.users[socketId] };
    if (roomId) await this.leaveRoom({ roomId, socketId });
    delete this.lobby.users[socketId];
    console.log(`${socketId} has left the lobby!`);
    return { leaveRoomId: roomId };
  }

  async createRoom(dto: CreateRoomDto) {
    const roomId = generateRoomId();
    const { roomName, socketId } = dto;
    const room: RoomWithUsers = {
      id: roomId,
      name: roomName,
      users: {},
    };
    this.lobby.rooms[roomId] = room;
    return room;
  }

  async joinRoom(dto: JoinRoomDto) {
    const { roomId, socketId } = dto;
    const userWithRoom = await this.getUser(socketId);
    const room = await this.getRoom(roomId);
    const { roomId: _, ...user } = userWithRoom;
    room.users[socketId] = user;
    this.lobby.users[socketId].roomId = roomId;

    console.log(`${socketId} has joined room ${roomId}!`);
    return { user };
  }

  async leaveRoom(dto: LeaveRoomDto) {
    const { users, rooms } = this.lobby;
    const { roomId, socketId } = dto;
    const room = await this.getRoom(roomId);

    delete room.users[socketId];
    users[socketId].roomId = null;

    const shouldDeleteRoom = Object.keys(room.users).length === 0;
    if (shouldDeleteRoom) {
      this.eventEmitter.emit(ROOM_DELETED, { roomId });
      delete rooms[roomId];
    }

    console.log(`${socketId} has left room ${roomId}!`);
    return { shouldDeleteRoom };
  }

  async getRooms() {
    return this.lobby.rooms;
  }

  async getUsers() {
    return this.lobby.users;
  }

  async getRoom(id: string) {
    const { rooms } = this.lobby;
    if (!rooms[id]) throw new NotFoundException(`Room not found: ${id}`);
    return rooms[id];
  }

  async getUser(socketId: string) {
    const { users } = this.lobby;
    if (!users[socketId])
      throw new NotFoundException(`User not found: ${socketId}`);
    return users[socketId];
  }

  async getUserCurrentRoomId(socketId: string) {
    const user = await this.getUser(socketId);
    return user.roomId;
  }
}
