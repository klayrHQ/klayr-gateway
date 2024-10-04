import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LokiLogger } from 'nestjs-loki-logger';

@Catch()
export class LokiExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new LokiLogger(LokiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const route = host.switchToHttp().getRequest().url;

    this.logger.error(`Route: ${route}`);
    this.logger.error(exception.toString());

    super.catch(exception, host);
  }
}
