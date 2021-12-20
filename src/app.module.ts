import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DownloaderModule } from './core/downloader/downloader.module';
import { StreamController } from './core/stream/stream.controller';
import { StreamModule } from './core/stream/stream.module';
import { LobbyModule } from './lobby/lobby.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DownloaderModule,
    StreamModule,
    LobbyModule,
  ],
  controllers: [StreamController],
  providers: [],
})
export class AppModule {}
