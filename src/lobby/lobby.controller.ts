import { Controller, Get, Param } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get('rooms')
  async getRooms() {
    return this.lobbyService.getRooms();
  }

  @Get('rooms/:roomId')
  async getRoom(@Param('roomId') roomId: string) {
    return this.lobbyService.getRoom(roomId);
  }

  @Get('users')
  async getUsers() {
    return this.lobbyService.getUsers();
  }
}
