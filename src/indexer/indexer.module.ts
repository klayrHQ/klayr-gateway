import { Module } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [NodeApiModule, EventModule],
  controllers: [],
  providers: [IndexerService],
})
export class IndexerModule {}
