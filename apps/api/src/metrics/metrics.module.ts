import { Global, Module } from '@nestjs/common';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { HttpMetricsMiddleware } from './http-metrics.middleware';

const scenarioRunsCounter = makeCounterProvider({
  name: 'scenario_runs_total',
  help: 'Total scenario runs',
  labelNames: ['type', 'status'],
});
const scenarioDurationHistogram = makeHistogramProvider({
  name: 'scenario_run_duration_seconds',
  help: 'Scenario run duration in seconds',
  labelNames: ['type'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 30],
});
const httpRequestsCounter = makeCounterProvider({
  name: 'http_requests_total',
  help: 'HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
});

const metricProviders = [scenarioRunsCounter, scenarioDurationHistogram, httpRequestsCounter];

@Global()
@Module({
  imports: [PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } })],
  providers: [HttpMetricsMiddleware, ...metricProviders],
  exports: [PrometheusModule, ...metricProviders],
})
export class MetricsModule {}
