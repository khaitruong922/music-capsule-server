import { Module } from "@nestjs/common"
import { LobbyService } from "./lobby.service"
import { LobbyGateway } from "./lobby.gateway"
import { LobbyController } from "./lobby.controller"

@Module({
    providers: [LobbyGateway, LobbyService],
    exports: [LobbyService],
    controllers: [LobbyController],
})
export class LobbyModule {}
