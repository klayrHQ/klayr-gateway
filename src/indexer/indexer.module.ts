import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  controllers: [],
  providers: [IndexerService],
})
export class IndexerModule {}
