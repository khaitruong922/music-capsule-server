import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ADD_TO_QUEUE } from './stream.event';
import { AddToQueueDto } from './stream.interface';
import { StreamService } from './stream.service';

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class StreamGateway {
  constructor(private readonly streamService: StreamService) {}

  @SubscribeMessage(ADD_TO_QUEUE)
  async addToQueue(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: AddToQueueDto,
  ) {
    const { fileName } = await this.streamService.addToQueue(dto);
    socket.emit(ADD_TO_QUEUE, { fileName });
  }
}
