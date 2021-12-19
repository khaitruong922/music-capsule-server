import { Injectable } from '@nestjs/common';
import { generateRoomId } from 'src/common/utils/id';
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
  private lobby: Lobby = {
    rooms: {},
    users: {},
  };

  async joinLobby(dto: JoinLobbyDto) {
    const { user, socketId } = dto;
    this.lobby.users[socketId] = { ...user, socketId, rooms: {} };
  }

  async leaveLobby(dto: LeaveLobbyDto) {
    const { socketId } = dto;
    const { rooms } = { ...this.lobby.users[socketId] };
    const roomIds = Object.keys(rooms);
    roomIds.forEach((roomId) => {
      this.leaveRoom({ roomId, socketId });
    });
    delete this.lobby.users[socketId];
    return { leaveRoomIds: roomIds };
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

    await this.joinRoom({ roomId, socketId });

    return room;
  }

  async joinRoom(dto: JoinRoomDto) {
    const { roomId, socketId } = dto;
    const userWithRooms = await this.getUser(socketId);
    const room = await this.getRoom(roomId);

    const { rooms, ...user } = userWithRooms;

    room.users[socketId] = user;
    this.lobby.users[socketId].rooms[roomId] = { id: roomId, name: room.name };

    console.log(`${socketId} has joined room ${roomId}!`);
    return { user };
  }

  async leaveRoom(dto: LeaveRoomDto) {
    const { users, rooms } = this.lobby;
    const { roomId, socketId } = dto;
    const room = await this.getRoom(roomId);

    delete room.users[socketId];
    delete users[socketId].rooms[roomId];

    const shouldDeleteRoom = Object.keys(room.users).length === 0;
    if (shouldDeleteRoom) delete rooms[roomId];

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
    if (!rooms[id]) throw new Error(`Room not found: ${id}`);
    return rooms[id];
  }

  async getUser(socketId: string) {
    const { users } = this.lobby;
    if (!users[socketId]) throw new Error(`User not found: ${socketId}`);
    return users[socketId];
  }
}
