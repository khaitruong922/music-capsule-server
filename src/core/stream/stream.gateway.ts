import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { START_STREAMING } from './stream.event';
import { StartStreamingDto } from './stream.interface';
import { StreamService } from './stream.service';

@WebSocketGateway({ cors: true, origin: true, credential: true })
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly streamService: StreamService) {}

  @SubscribeMessage(START_STREAMING)
  async onStartStreaming(
    @ConnectedSocket() socket: Socket,
    @MessageBody() startStreamingDto: StartStreamingDto,
  ) {
    const { url } = startStreamingDto;
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    console.log(`Socket ${socket.id} connected!`);
  }
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(`Socket ${socket.id} disconnected!`);
  }
}
