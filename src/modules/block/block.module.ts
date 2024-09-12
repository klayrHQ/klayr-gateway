import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  providers: [],
  controllers: [BlockController],
})
export class BlockModule {}
