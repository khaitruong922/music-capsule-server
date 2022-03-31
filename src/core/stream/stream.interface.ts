export interface Song {
    fileName: string
    title: string
    author: string
    length: number
    startTime?: number
}

export interface SongQueues {
    [roomId: string]: Song[]
}

export interface RoomsTimeout {
    [roomId: string]: NodeJS.Timeout
}

export interface WithRoomId {
    roomId: string
}
export interface AddSongMessageDto {
    url: string
    semitoneShift?: number
    playbackSpeed?: number
}

export interface AddSongDto extends AddSongMessageDto, WithRoomId {}

export interface NextSongEventPayload {
    roomId: string
    song: Song
}

export interface StartSongEventPayload {
    roomId: string
}
export interface RoomSongChangedEventPayload {
    roomId: string
}
