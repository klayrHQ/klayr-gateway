import { Module } from '@nestjs/common';
import { PosController } from './pos.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';
import { StateModule } from 'src/modules/state/state.module';

@Module({
  imports: [StateModule, NodeApiModule],
  providers: [],
  controllers: [PosController],
})
export class PosModule {}
