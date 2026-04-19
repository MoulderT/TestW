import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { MetricsModule } from './metrics/metrics.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScenarioModule } from './scenario/scenario.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        messageKey: 'message',
        customProps: () => ({
          app: 'signal-lab',
          context: 'http',
        }),
        serializers: {
          req: (req: { id?: string; method?: string; url?: string }) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
        },
      },
    }),
    MetricsModule,
    PrismaModule,
    ScenarioModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
