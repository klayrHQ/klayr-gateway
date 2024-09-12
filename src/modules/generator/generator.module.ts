import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [GeneratorController],
})
export class GeneratorModule {}
