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
import { GeneratorModule } from './generator/generator.module';
import { DbCacheModule } from './db-cache/db-cache.module';
import { PrismaModule } from './prisma/prisma.module';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    PrismaModule,
    StateModule,
    NodeApiModule,
    EventModule,
    DbCacheModule,
    BlockModule,
    TransactionModule,
    AssetModule,
    ValidatorModule,
    AccountModule,
    IndexerModule,
    ChainEventModule,
    GeneratorModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
