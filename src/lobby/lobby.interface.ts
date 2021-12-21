import { Song } from 'src/core/stream/stream.interface';

export interface WithSocketId {
  socketId: string;
}

export interface Lobby {
  users: { [socketId: string]: UserWithRoom };
  rooms: { [roomId: string]: RoomWithUsers };
}

export interface User {
  name: string;
}

export interface UserWithSocketId extends User, WithSocketId {}

export interface UserWithRoom extends UserWithSocketId {
  roomId: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface RoomWithUsers extends Room {
  users: {
    [socketId: string]: User;
  };
  queue: Song[];
  timeout?: NodeJS.Timeout;
}

export interface CreateRoomMessageDto {
  roomName: string;
}
export interface CreateRoomDto extends CreateRoomMessageDto, WithSocketId {}

export interface JoinRoomMessageDto {
  roomId: string;
}
export interface JoinRoomDto extends JoinRoomMessageDto, WithSocketId {}

export interface LeaveRoomMessageDto {
  roomId: string;
}
export interface LeaveRoomDto extends LeaveRoomMessageDto, WithSocketId {}

export interface JoinLobbyMessageDto {
  user: User;
}
export interface JoinLobbyDto extends JoinLobbyMessageDto, WithSocketId {}

export interface LeaveLobbyMessageDto {
  socketId: string;
}
export interface LeaveLobbyDto extends LeaveLobbyMessageDto, WithSocketId {}

export interface RoomResponse extends Room {
  users: Users;
  queue: Song[];
}

export interface LobbyResponse {
  rooms: LobbyRoomsResponse;
}

export interface LobbyRoomsResponse {
  [roomId: string]: LobbyRoomResponse;
}

export interface LobbyRoomResponse extends Room {
  userCount: number;
  nowPlaying: Song;
}

export interface Users {
  [socketId: string]: User;
}
