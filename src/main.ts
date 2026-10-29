import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { json } from 'express';
import { SanitizarRespuestaInterceptor } from './common/interceptors/sanitizar-respuesta.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ⭐ Railway pone un proxy delante: sin esto todas las peticiones parecían venir de la misma IP
  // (la del proxy) y el límite de intentos de login/registro se compartía entre todos los usuarios.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // ⭐ Cabeceras de seguridad básicas (lo esencial de helmet, sin añadir dependencias).
  // Es una API JSON: no sirve páginas, así que se puede ser estricto.
  app.use((_req: any, res: any, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  });

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
