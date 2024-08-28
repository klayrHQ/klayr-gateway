import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LokiLogger } from 'nestjs-loki-logger';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  private readonly lokiLogger = new LokiLogger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    this.lokiLogger.error(exception.toString());
    super.catch(exception, host);
  }
}
