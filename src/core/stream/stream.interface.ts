export interface Song {
  fileName: string;
  title: string;
  author: string;
  length: number;
  startTime?: number;
}

export interface SongQueues {
  [roomId: string]: Song[];
}

export interface RoomsTimeout {
  [roomId: string]: NodeJS.Timeout;
}

export interface WithRoomId {
  roomId: string;
}
export interface AddSongMessageDto {
  url: string;
}

export interface AddSongDto extends AddSongMessageDto, WithRoomId {}

export interface NextSongEventPayload {
  roomId: string;
}

export interface StartSongEventPayload {
  roomId: string;
}
