import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { ValidatorModule } from 'src/validator/validator.module';

@Module({
  imports: [ValidatorModule, NodeApiModule],
  controllers: [GeneratorController],
})
export class GeneratorModule {}
