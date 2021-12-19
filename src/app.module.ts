import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DownloaderModule } from './core/downloader/downloader.module';
import { StreamModule } from './core/stream/stream.module';
import { LobbyModule } from './lobby/lobby.module';
import { StreamController } from './core/stream/stream.controller';

@Module({
  imports: [
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
