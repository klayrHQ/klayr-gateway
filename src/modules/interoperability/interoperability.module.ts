import { Module } from '@nestjs/common';
import { InteroperabilityController } from './interoperability.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [InteroperabilityController],
})
export class InteroperabilityModule {}
