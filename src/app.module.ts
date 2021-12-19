import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DownloaderModule } from './core/downloader/downloader.module';
import { StreamModule } from './core/stream/stream.module';
import { LobbyModule } from './lobby/lobby.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DownloaderModule,
    StreamModule,
    LobbyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
