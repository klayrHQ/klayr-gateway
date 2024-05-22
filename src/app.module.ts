import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './node-api/node-api.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot(),
    IndexerModule,
    NodeApiModule,
    EventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
