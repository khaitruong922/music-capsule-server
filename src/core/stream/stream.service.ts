import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RoomDeletedEventPayload, ROOM_DELETED } from 'src/lobby/lobby.event';
import { DownloaderService } from '../downloader/downloader.service';
import { AddSongDto, Song, SongQueues } from './stream.interface';

@Injectable()
export class StreamService {
  private songQueues: SongQueues = {};

  constructor(private readonly downloaderService: DownloaderService) {}

  async addSong(dto: AddSongDto) {
    const { url, roomId } = dto;
    this.createRoomQueueIfNotExist(roomId);
    const queue = this.songQueues[roomId];

    const { fileName, videoData } = await this.downloaderService.saveToDisk({
      url,
      format: 'audioonly',
    });

    const song: Song = { ...videoData, fileName, startTime: null };
    // Queue is empty - start now
    if (queue.length === 0) {
      song.startTime = Date.now() / 1000;
    }
    // Queue is not empty - wait
    else {
      song.startTime = null;
    }

    queue.push(song);

    return { song };
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
    delete this.songQueues[roomId];
  }
}
