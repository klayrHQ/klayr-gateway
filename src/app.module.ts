import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './modules/indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './modules/node-api/node-api.module';
import { BlockModule } from './modules/block/block.module';
import { PosModule } from './modules/pos/pos.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AccountModule } from './modules/account/account.module';
import { EventModule } from './modules/event/event.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StateModule } from './modules/state/state.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SearchModule } from './modules/search/search.module';
import { LokiLoggerModule } from 'nestjs-loki-logger';
import { TokenModule } from './modules/token/token.module';
import { LockEndpointsMiddleware } from './middleware/lock-endpoints.middleware';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { NetworkModule } from './modules/network/network.module';
import { NftModule } from './modules/nft/nft.module';
import { ValidatorModule } from './modules/validator/validator.module';
import { SchemasModule } from './modules/schemas/schemas.module';
import { RewardModule } from './modules/reward/reward.module';
import { APP_FILTER } from '@nestjs/core';
import { LokiExceptionFilter } from './filters/all-exceptions.filter';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    LokiLoggerModule.forRootAsync({
      useFactory: () => ({
        lokiUrl: process.env.LOKI_URL,
        labels: {
          job: process.env.LOKI_APP,
        },
        logToConsole: true,
      }),
    }),
    PrismaModule,
    StateModule,
    NodeApiModule,
    BlockModule,
    TransactionModule,
    PosModule,
    AccountModule,
    IndexerModule,
    EventModule,
    GeneratorModule,
    SearchModule,
    TokenModule,
    HealthModule,
    AuthModule,
    NetworkModule,
    ValidatorModule,
    NftModule,
    SchemasModule,
    RewardModule,
    BlockchainModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LokiExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LockEndpointsMiddleware).forRoutes('*');
  }
}
