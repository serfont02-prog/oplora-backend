import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json } from 'express';
import { SanitizarRespuestaInterceptor } from './common/interceptors/sanitizar-respuesta.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));
  // ⭐ Quita de todas las respuestas los secretos y los datos privados de otros usuarios.
  app.useGlobalInterceptors(new SanitizarRespuestaInterceptor());
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
