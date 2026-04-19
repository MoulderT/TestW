import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Counter } from 'prom-client';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequests: Counter<string>,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path || req.url?.split('?')[0] || '';
    if (path === '/metrics' || path.endsWith('/metrics')) {
      return next();
    }

    res.on('finish', () => {
      try {
        const routePath = req.route?.path
          ? `${req.baseUrl}${req.route.path}`
          : path || 'unknown';
        const normalized = routePath.replace(/\/[0-9a-f-]{20,}/gi, '/:id');
        this.httpRequests.inc({
          method: req.method,
          path: normalized.slice(0, 100),
          status_code: String(res.statusCode),
        });
      } catch {
        // never let Prometheus labels take down the API process
      }
    });

    next();
  }
}
