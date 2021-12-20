import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { RoomDeletedEventPayload, ROOM_DELETED } from 'src/lobby/lobby.event';
import { DownloaderService } from '../downloader/downloader.service';
import { NEXT_SONG } from './stream.event';
import { AddSongDto, RoomsTimeout, Song, SongQueues } from './stream.interface';

@Injectable()
export class StreamService {
  private songQueues: SongQueues = {};
  private timeouts: RoomsTimeout = {};

  constructor(
    private readonly downloaderService: DownloaderService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async addSong(dto: AddSongDto) {
    const { url, roomId } = dto;
    this.createRoomQueueIfNotExist(roomId);
    const queue = this.songQueues[roomId];

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
    this.createRoomQueueIfNotExist(roomId);
    const queue = this.songQueues[roomId];
    const currentSong = queue[0];
    if (!currentSong) return;

    const OFFSET_SECONDS = 1;
    currentSong.startTime = (Date.now() + OFFSET_SECONDS) / 1000;
    const { length } = currentSong;

    console.log(`Move to next song in ${length} seconds`);
    this.timeouts[roomId] = setTimeout(() => {
      // Start next song
      this.skip(roomId);
    }, (length + OFFSET_SECONDS) * 1000);
  }

  skip(roomId: string) {
    this.createRoomQueueIfNotExist(roomId);
    const queue = this.songQueues[roomId];
    clearTimeout(this.timeouts[roomId]);
    queue.shift();
    this.nextSong(roomId);
    this.eventEmitter.emit(NEXT_SONG, { roomId });
  }

  createRoomQueueIfNotExist(roomId: string) {
    if (this.songQueues.hasOwnProperty(roomId)) return;
    this.songQueues[roomId] = [];
  }

  getQueues() {
    return this.songQueues;
  }

  getQueue(roomId: string) {
    return this.songQueues[roomId];
  }

  @OnEvent(ROOM_DELETED)
  deleteQueue(payload: RoomDeletedEventPayload) {
    const { roomId } = payload;
    clearTimeout(this.timeouts[roomId]);
    delete this.songQueues[roomId];
  }
}
