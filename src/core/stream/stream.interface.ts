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

export interface WithRoomId {
  roomId: string;
}
export interface AddSongMessageDto {
  url: string;
}

export interface AddSongDto extends AddSongMessageDto, WithRoomId {}
