import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { productionHttpConfig } from './production-http-config';

async function bootstrap() {
  // bodyParser is disabled so we can capture the raw request body required
  // for Stripe-like webhook signature verification, then re-enable parsing.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const isProduction = process.env.NODE_ENV === 'production';
  const productionConfig = isProduction ? productionHttpConfig(process.env) : null;
  if (productionConfig) {
    app.getHttpAdapter().getInstance().set('trust proxy', productionConfig.trustedProxies);
    app.use((req: any, res: any, next: () => void) => {
      const localHealth = req.path === '/api/v1/health'
        && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      if (req.secure || localHealth) return next();
      res.status(426).json({ statusCode: 426, message: 'HTTPS is required' });
    });
  }

  // Capture raw body bytes for signature verification, then parse JSON normally.
  app.use(json({ limit: '100kb', verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  // Serve Static Files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // API headers; the HTTPS reverse proxy must also protect the frontend.
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: false },
    referrerPolicy: { policy: 'no-referrer' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: isProduction ? ["'self'", 'data:', 'https:'] : ["'self'", 'data:', 'https:', 'http://localhost:3000'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  }));

  // Use Winston Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Set Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger only available outside production
  if (!isProduction) {
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
  const configuredClientOrigin = productionConfig?.clientOrigin || process.env.CLIENT_URL || 'http://localhost:5173';
  const isDevelopment = !isProduction;

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

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  app.enableShutdownHooks();
  await app.listen(process.env.PORT || 3000, isProduction ? (process.env.APP_BIND_HOST || '127.0.0.1') : '0.0.0.0');
}
bootstrap();
