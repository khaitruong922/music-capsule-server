import { Injectable } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { Lobby } from "src/core/lobby/lobby.interface"
import { LobbyService } from "src/core/lobby/lobby.service"
import { InvalidFastForward, InvalidSkip } from "../chat/chat.exception"
import { DownloaderService } from "../downloader/downloader.service"
import { ROOM_DELETED } from "../lobby/lobby.event"
import {
    FAST_FORWARD,
    NEXT_SONG,
    QUEUE_CHANGED,
    ROOM_SONG_CHANGED,
    SKIP,
} from "./stream.event"
import {
    AddSongDto,
    FastForwardDto,
    SkipIndexDto,
    Song,
} from "./stream.interface"
@Injectable()
export class StreamService {
    private lobby: Lobby
    private OFFSET_SECONDS = 2

    constructor(
        private readonly lobbyService: LobbyService,
        private readonly downloaderService: DownloaderService,
        private readonly eventEmitter: EventEmitter2,
    ) {
        this.lobby = this.lobbyService.lobby
    }

    async addSong(dto: AddSongDto) {
        const { roomId } = dto
        const { queue } = this.lobby.rooms[roomId]

        const { fileName, videoData, url } =
            await this.downloaderService.download({
                ...dto,
                format: "audioonly",
            })

        const song: Song = {
            ...videoData,
            fileName,
            startTime: null,
            youtubeUrl: url,
        }

        console.log(`${song.title} has been added to queue!`)
        // Queue has only 1 song - start now
        queue.push(song)
        if (queue.length === 1) {
            this.nextSong(roomId)
        }
        return { song }
    }

    nextSong(roomId: string) {
        const { queue } = this.lobby.rooms[roomId]

        const currentSong = queue[0]
        this.eventEmitter.emit(ROOM_SONG_CHANGED, { roomId, song: currentSong })
        if (!currentSong) return

        currentSong.startTime = Date.now() / 1000 + this.OFFSET_SECONDS
        const { length } = currentSong

        this.scheduleNextSong(roomId, length - this.OFFSET_SECONDS)
    }

    fastForward(dto: FastForwardDto) {
        const { seconds, roomId, socketId } = dto
        const { queue } = this.lobbyService.getRoom(roomId)

        const currentSong = queue[0]
        if (!currentSong) throw new InvalidFastForward("No song playing")

        const { length } = currentSong
        const lengthLeft = length - (Date.now() / 1000 - currentSong.startTime)
        if (lengthLeft - seconds < 0)
            throw new InvalidFastForward("Song length exceeded")

        currentSong.startTime -= seconds

        const username = this.lobbyService.getUser(socketId).name
        this.eventEmitter.emit(FAST_FORWARD, {
            roomId,
            song: currentSong,
            seconds,
            username,
        })

        this.scheduleNextSong(roomId, lengthLeft - seconds)
    }

    scheduleNextSong(roomId: string, seconds: number) {
        clearTimeout(this.lobby.rooms[roomId].timeout)
        console.log(`Next song in ${seconds} seconds`)
        this.lobby.rooms[roomId].timeout = setTimeout(() => {
            this.skip(roomId)
        }, seconds * 1000)
    }

    skip(roomId: string) {
        const { queue, timeout } = this.lobby.rooms[roomId]
        clearTimeout(timeout)
        queue.shift()
        this.nextSong(roomId)
        const song = queue[0]
        this.eventEmitter.emit(NEXT_SONG, { roomId, song })
        const room = this.lobbyService.getRoom(roomId)
        if (!song && Object.keys(room.users).length === 0) {
            this.eventEmitter.emit(ROOM_DELETED, { roomId })
        }
    }

    skipIndex(dto: SkipIndexDto) {
        const { i, roomId, socketId } = dto
        const room = this.lobbyService.getRoom(roomId)
        const { queue } = room
        if (queue.length === 0) throw new InvalidSkip("Queue is empty")
        if (i >= queue.length)
            throw new InvalidSkip(`Song number ${i + 1} not in queue`)
        if (i == 0) {
            const { title } = queue[0]
            this.eventEmitter.emit(SKIP, { title, socketId })
            this.skip(roomId)
            return
        }
        const user = this.lobbyService.getUser(socketId)
        const { name: username } = user
        const song = queue.splice(i, 1)
        const title = song[0].title
        this.eventEmitter.emit(QUEUE_CHANGED, {
            roomId,
            queue,
            username,
            title,
        })
    }
}
