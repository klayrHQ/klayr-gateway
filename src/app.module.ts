import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './node-api/node-api.module';
import { EventModule } from './event/event.module';
import { BlockModule } from './block/block.module';
import { AssetModule } from './asset/asset.module';
import { ValidatorModule } from './validator/validator.module';
import { TransactionModule } from './transaction/transaction.module';
import { AccountModule } from './account/account.module';
import { ChainEventModule } from './chain-event/chain-event.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StateModule } from './state/state.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    StateModule,
    NodeApiModule,
    EventModule,
    BlockModule,
    TransactionModule,
    AssetModule,
    ValidatorModule,
    AccountModule,
    IndexerModule,
    ChainEventModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
