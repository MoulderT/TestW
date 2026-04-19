import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { HttpMetricsMiddleware } from './metrics/http-metrics.middleware';

async function bootstrap() {
  const dsn = process.env.SENTRY_DSN ?? process.env.SIGNAL_LAB_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    });
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  // Express-level hook: avoids Nest 11 + path-to-regexp issues with forRoutes('*') that can break /api routes
  const httpMetrics = app.get(HttpMetricsMiddleware);
  app.use((req: Request, res: Response, next: NextFunction) =>
    httpMetrics.use(req, res, next),
  );
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'metrics', method: RequestMethod.GET }],
  });
  const webOrigins =
    process.env.WEB_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];
  app.enableCors({
    origin: webOrigins,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Signal Lab API')
    .setDescription('Scenarios, health, metrics')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}
bootstrap();
