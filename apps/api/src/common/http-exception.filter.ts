import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return res.status(status).json(
        typeof body === 'string'
          ? { statusCode: status, message: body }
          : { statusCode: status, ...(typeof body === 'object' ? body : {}) },
      );
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    return res.status(status).json({
      statusCode: status,
      message: 'Internal server error',
    });
  }
}
