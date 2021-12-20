import { HttpException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LobbyService } from 'src/lobby/lobby.service';
import {
  ADD_SONG,
  ADD_SONG_FAILED,
  ADD_SONG_SUCCESS,
  NEXT_SONG,
  SKIP,
  SONG_ADDED,
} from './stream.event';
import { AddSongMessageDto, NextSongEventPayload } from './stream.interface';
import { StreamService } from './stream.service';

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class StreamGateway {
  @WebSocketServer()
  io: Server;

  constructor(
    private readonly streamService: StreamService,
    private readonly lobbyService: LobbyService,
  ) {}

  @SubscribeMessage(ADD_SONG)
  async addSong(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: AddSongMessageDto,
  ) {
    try {
      const { id: socketId } = socket;
      const roomId = await this.lobbyService.getUserCurrentRoomId(socketId);
      const { song } = await this.streamService.addSong({ ...dto, roomId });
      this.io.to(roomId).emit(SONG_ADDED, { song });
      socket.emit(ADD_SONG_SUCCESS, { song });
    } catch (e) {
      let message = 'An exception occured!';
      if (e instanceof HttpException) {
        message = e.message;
      }
      socket.emit(ADD_SONG_FAILED, { message });
    }
  }

  @OnEvent(NEXT_SONG)
  async nextSong(payload: NextSongEventPayload) {
    const { roomId } = payload;
    this.io.to(roomId).emit(NEXT_SONG);
  }

  @SubscribeMessage(SKIP)
  async skip(@ConnectedSocket() socket: Socket) {
    const { id: socketId } = socket;
    const roomId = await this.lobbyService.getUserCurrentRoomId(socketId);
    console.log(roomId);
    this.streamService.skip(roomId);
  }
}
