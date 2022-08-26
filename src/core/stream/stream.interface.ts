export interface Song {
    fileName: string
    title: string
    channel: string
    length: number
    startTime?: number
    thumbnailUrl: string
    youtubeUrl: string
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

export interface FastForwardDto extends WithRoomId {
    seconds: number
    socketId: string
}

export interface SkipIndexDto extends WithRoomId {
    i: number
    socketId: string
}

export interface NextSongEventPayload extends WithRoomId {
    song: Song
    username: string
}

export interface FastForwardPayload extends WithRoomId {
    song: Song
    username: string
    seconds: number
}
export interface QueueChangedPayload extends WithRoomId {
    username: string
    title: string
    queue: Song[]
}

export interface StartSongEventPayload {
    roomId: string
}
export interface RoomSongChangedEventPayload {
    roomId: string
}
