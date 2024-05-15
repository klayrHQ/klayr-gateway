import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';

@Module({
  controllers: [],
  providers: [IndexerService],
})
export class IndexerModule {}
