import { Module } from '@nestjs/common';
import { InteroperabilityController } from './interoperability.controller';

@Module({
  imports: [],
  controllers: [InteroperabilityController],
})
export class InteroperabilityModule {}
