import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { RoomDeletedEventPayload, ROOM_DELETED } from 'src/lobby/lobby.event';
import { Lobby } from 'src/lobby/lobby.interface';
import { LobbyService } from 'src/lobby/lobby.service';
import { DownloaderService } from '../downloader/downloader.service';
import { NEXT_SONG, ROOM_SONG_CHANGED } from './stream.event';
import { AddSongDto, RoomsTimeout, Song, SongQueues } from './stream.interface';

@Injectable()
export class StreamService {
  private lobby: Lobby;

  constructor(
    private readonly lobbyService: LobbyService,
    private readonly downloaderService: DownloaderService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.lobby = this.lobbyService.lobby;
  }

  async addSong(dto: AddSongDto) {
    const { url, roomId } = dto;
    const { queue } = this.lobby.rooms[roomId];

    const { fileName, videoData } = await this.downloaderService.saveToDisk({
      url,
      format: 'audioonly',
    });

    const song: Song = { ...videoData, fileName, startTime: null };

    console.log(`${song.title} has been added to queue!`);
    // Queue has only 1 song - start now
    queue.push(song);
    if (queue.length === 1) {
      this.nextSong(roomId);
    }
    return { song };
  }

  nextSong(roomId: string) {
    const { queue } = this.lobby.rooms[roomId];

    const currentSong = queue[0];
    if (!currentSong) return;

    const OFFSET_SECONDS = 1;
    currentSong.startTime = (Date.now() + OFFSET_SECONDS) / 1000;
    const { length } = currentSong;
    this.eventEmitter.emit(ROOM_SONG_CHANGED, { roomId, song: currentSong });

    console.log(`Move to next song in ${length} seconds`);
    this.lobby.rooms[roomId].timeout = setTimeout(() => {
      // Start next song
      this.skip(roomId);
    }, (length + OFFSET_SECONDS) * 1000);
  }

  skip(roomId: string) {
    const { queue, timeout } = this.lobby.rooms[roomId];
    clearTimeout(timeout);
    queue.shift();
    this.nextSong(roomId);
    const song = queue[0];
    this.eventEmitter.emit(NEXT_SONG, { roomId, song });
  }
}
