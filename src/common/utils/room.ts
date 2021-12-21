import { LobbyRoomResponse, RoomWithUsers } from 'src/lobby/lobby.interface';

export function lobbyRoomResponse(room: RoomWithUsers): LobbyRoomResponse {
  const { id, name, queue, users } = room;
  return {
    id,
    name,
    userCount: Object.keys(users).length,
    nowPlaying: queue[0],
  };
}
