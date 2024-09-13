import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Get, Controller } from '@nestjs/common';
import { IsSyncedIndicator } from './gateway.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private isSyncedIndicator: IsSyncedIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([() => this.isSyncedIndicator.isHealthy('node')]);
  }
}
