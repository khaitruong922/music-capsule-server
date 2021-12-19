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
    [socketId: string]: UserWithSocketId;
  };
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
