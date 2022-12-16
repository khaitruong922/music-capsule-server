import { Module } from "@nestjs/common"
import { LobbyController } from "./lobby.controller"
import { LobbyGateway } from "./lobby.gateway"
import { LobbyService } from "./lobby.service"

@Module({
    providers: [LobbyGateway, LobbyService],
    exports: [LobbyService],
    controllers: [LobbyController],
})
export class LobbyModule {}
