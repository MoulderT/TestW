import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter, Histogram } from 'prom-client';
import { PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto } from './dto/run-scenario.dto';

@Injectable()
export class ScenarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: PinoLogger,
    @InjectMetric('scenario_runs_total')
    private readonly scenarioRunsTotal: Counter<string>,
    @InjectMetric('scenario_run_duration_seconds')
    private readonly durationHistogram: Histogram<string>,
  ) {}

  async recentRuns(limit = 20) {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async run(dto: RunScenarioDto) {
    const started = Date.now();
    const meta = dto.name ? { name: dto.name } : undefined;

    switch (dto.type) {
      case 'success':
        return this.finishSuccess('success', started, meta);
      case 'validation_error':
        return this.finishValidationError(started, meta);
      case 'system_error':
        return this.finishSystemError(started, meta);
      case 'slow_request': {
        await this.sleep(this.randomBetween(2000, 5000));
        return this.finishSuccess('slow_request', started, meta);
      }
      case 'teapot':
        return this.finishTeapot(started, meta);
      default: {
        const _e: never = dto.type;
        return _e;
      }
    }
  }

  private async finishSuccess(
    scenarioType: 'success' | 'slow_request',
    started: number,
    metadata?: Record<string, unknown>,
  ) {
    const duration = Date.now() - started;
    const row = await this.prisma.scenarioRun.create({
      data: {
        type: scenarioType,
        status: 'completed',
        duration,
        metadata: metadata as object | undefined,
      },
    });
    this.observeMetrics(scenarioType, 'completed', duration);
    this.logScenario('info', scenarioType, row.id, duration);
    return { id: row.id, status: 'completed' as const, duration };
  }

  private async finishValidationError(started: number, metadata?: Record<string, unknown>) {
    const duration = Date.now() - started;
    const row = await this.prisma.scenarioRun.create({
      data: {
        type: 'validation_error',
        status: 'failed',
        duration,
        error: 'validation_error scenario',
        metadata: metadata as object | undefined,
      },
    });
    this.scenarioRunsTotal.inc({ type: 'validation_error', status: 'failed' });
    Sentry.addBreadcrumb({
      category: 'scenario',
      message: 'validation_error',
      level: 'warning',
      data: { scenarioId: row.id },
    });
    this.logScenario('warn', 'validation_error', row.id, duration, 'validation failed');
    throw new BadRequestException({
      message: 'Validation failed',
      id: row.id,
    });
  }

  private async finishSystemError(started: number, metadata?: Record<string, unknown>) {
    const duration = Date.now() - started;
    const err = new Error('Signal Lab: system_error scenario');
    const row = await this.prisma.scenarioRun.create({
      data: {
        type: 'system_error',
        status: 'error',
        duration,
        error: err.message,
        metadata: metadata as object | undefined,
      },
    });
    this.scenarioRunsTotal.inc({ type: 'system_error', status: 'error' });
    this.durationHistogram.observe({ type: 'system_error' }, duration / 1000);
    Sentry.captureException(err);
    this.logScenario('error', 'system_error', row.id, duration, err.message);
    throw new InternalServerErrorException({
      message: 'Internal error (sent to Sentry)',
      id: row.id,
    });
  }

  private async finishTeapot(started: number, metadata?: Record<string, unknown>) {
    const duration = Date.now() - started;
    const row = await this.prisma.scenarioRun.create({
      data: {
        type: 'teapot',
        status: 'completed',
        duration,
        metadata: { ...(metadata ?? {}), easter: true } as object,
      },
    });
    this.scenarioRunsTotal.inc({ type: 'teapot', status: 'completed' });
    this.durationHistogram.observe({ type: 'teapot' }, duration / 1000);
    this.logScenario('info', 'teapot', row.id, duration);
    throw new HttpException({ signal: 42, message: "I'm a teapot" }, 418);
  }

  private observeMetrics(type: string, status: string, durationMs: number) {
    this.scenarioRunsTotal.inc({ type, status });
    this.durationHistogram.observe({ type }, durationMs / 1000);
  }

  private logScenario(
    level: 'info' | 'warn' | 'error',
    scenarioType: string,
    scenarioId: string,
    duration: number,
    error?: string,
  ) {
    const payload: Record<string, unknown> = {
      app: 'signal-lab',
      timestamp: new Date().toISOString(),
      level,
      message: 'scenario_run',
      scenarioType,
      scenarioId,
      duration,
      ...(error ? { error } : {}),
    };
    if (level === 'info') this.logger.info(payload);
    else if (level === 'warn') this.logger.warn(payload);
    else this.logger.error(payload);
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  private randomBetween(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }
}
