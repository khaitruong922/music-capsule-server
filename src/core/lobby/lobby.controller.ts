import { Controller, Get, Param } from '@nestjs/common'
import { LobbyResponse, LobbyRoomResponse } from './lobby.interface'
import { LobbyService } from './lobby.service'

@Controller('lobby')
export class LobbyController {
    constructor(private readonly lobbyService: LobbyService) {}

    @Get()
    getLobbyResponse() {
        return this.lobbyService.getLobbyResponse()
    }

    @Get('rooms/:roomId')
    getRoom(@Param('roomId') roomId: string) {
        return this.lobbyService.getRoomResponse(roomId)
    }

    @Get('users')
    getUsers() {
        return this.lobbyService.getUsers()
    }
}
