import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // bodyParser is disabled so we can capture the raw request body required
  // for Stripe-like webhook signature verification, then re-enable parsing.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });

  // Capture raw body bytes for signature verification, then parse JSON normally.
  app.use(json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  app.use(urlencoded({ extended: true }));

  // Serve Static Files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Security Headers with relaxed CSP for images
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:3000'],
        objectSrc: ["'none'"],
      },
    },
  }));

  // Use Winston Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Set Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger only available outside production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Tamil Food Thaya API')
      .setDescription('The API documentation for Tamil Food Thaya restaurant and catering platform.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document);
  }

  // Enable Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS for the configured client. In development Vite can select the
  // next free localhost port, so accept loopback origins without weakening the
  // production origin policy.
  const configuredClientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  const isDevelopment = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin, callback) => {
      const isAllowedDevelopmentOrigin =
        isDevelopment &&
        !!origin &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (!origin || origin === configuredClientOrigin || isAllowedDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
