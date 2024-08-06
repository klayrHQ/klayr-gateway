import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { AccountModule } from 'src/account/account.module';
import { NodeApiModule } from 'src/node-api/node-api.module';

@Module({
  imports: [AccountModule, NodeApiModule],
  controllers: [GeneratorController],
})
export class GeneratorModule {}
