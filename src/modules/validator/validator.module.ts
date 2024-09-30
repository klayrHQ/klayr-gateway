import { Module } from '@nestjs/common';
import { ValidatorController } from './validator.controller';
import { NodeApiModule } from '../node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
