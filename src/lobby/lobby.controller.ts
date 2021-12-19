import { Controller, Get } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get('rooms')
  async getRooms() {
    return this.lobbyService.getRooms();
  }

  @Get('users')
  async getUsers() {
    return this.lobbyService.getUsers();
  }
}
