import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';

function parseOrigins(env?: string) {
  return (env ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // bảo mật/hiệu năng (bật khi prod)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // chạy sau Apache/Nginx
    app.use(helmet());
    app.use(compression());
  }

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // prefix chung
  app.setGlobalPrefix('api');

  // ===== CORS =====
  // .env của bạn:
  // ALLOWED_ORIGINS=https://2025-fullstack-demo.vercel.app,http://localhost:3000
  const allowedFromEnv = parseOrigins(process.env.ALLOWED_ORIGINS);
  const defaultOrigins = [
    'https://2025-fullstack-demo.vercel.app',
    'http://localhost:3000',
  ];
  const origins = allowedFromEnv.length ? allowedFromEnv : defaultOrigins;

  app.enableCors({
    origin: origins, // cho phép 2 origin này
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
  });

  // Swagger
  const cfg = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('API for managing users')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, cfg));

  // Static
  const STORAGE_DIR = process.env.STORAGE_DIR || 'storage';
  app.use(
    '/assets',
    express.static(join(process.cwd(), STORAGE_DIR), {
      setHeaders: (res) => {
        // Cho phép dùng ảnh từ domain khác (frontend)
        res.setHeader('Access-Control-Allow-Origin', '*');
        // Tránh lỗi NotSameOrigin khi load image trong <img> / canvas
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
}
bootstrap();
