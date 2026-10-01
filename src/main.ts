import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));
  app.use(json({ limit: '5mb' })); // ⭐ aumenta el límite de payload JSON

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://oplora-frontend.vercel.app',
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
