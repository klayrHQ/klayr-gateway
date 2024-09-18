import { Module } from '@nestjs/common';
import { ValidatorController } from './validator.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';
import { StateModule } from 'src/modules/state/state.module';

@Module({
  imports: [StateModule, NodeApiModule],
  providers: [],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
