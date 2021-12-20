import { Controller, Get, Param } from '@nestjs/common';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('queues')
  async getQueues() {
    return this.streamService.getQueues();
  }

  @Get('queues/:roomId')
  async getQueue(@Param('roomId') roomId: string) {
    return this.streamService.getQueue(roomId);
  }
}
