import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import { AppModule } from './app.module';
import { ExceptionFilter } from './common/filter/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 3001;
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.useStaticAssets(path.join(process.cwd(), 'public'), {
    prefix: '/public',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Music Streaming App API')
    .setDescription('Documentation for Music Streaming App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: 0,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Music Streaming App API',
    },
  });

  await app.listen(PORT, () => {
    console.log(`Server started in http://localhost:${PORT}`);
  });
}
bootstrap();
