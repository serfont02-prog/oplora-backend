import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ... dentro de bootstrap(), después de crear la app:
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