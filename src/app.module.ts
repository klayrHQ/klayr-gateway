import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './node-api/node-api.module';
import { EventModule } from './event/event.module';
import { BlockModule } from './block/block.module';
import { AssetModule } from './asset/asset.module';
import { ValidatorModule } from './validator/validator.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot(),
    IndexerModule,
    NodeApiModule,
    EventModule,
    BlockModule,
    AssetModule,
    ValidatorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
