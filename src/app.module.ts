import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './node-api/node-api.module';
import { EventModule } from './event/event.module';
import { BlockModule } from './block/block.module';
import { ValidatorModule } from './validator/validator.module';
import { TransactionModule } from './transaction/transaction.module';
import { AccountModule } from './account/account.module';
import { ChainEventModule } from './chain-event/chain-event.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StateModule } from './state/state.module';
import { GeneratorModule } from './generator/generator.module';
import { PrismaModule } from './prisma/prisma.module';
import { SearchModule } from './search/search.module';
import { LokiLoggerModule } from 'nestjs-loki-logger';
import { TokenModule } from './token/token.module';
import { LockEndpointsMiddleware } from './middleware/lock-endpoints.middleware';
import { StakeModule } from './stake/stake.module';

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
    EventModule,
    BlockModule,
    TransactionModule,
    ValidatorModule,
    AccountModule,
    IndexerModule,
    ChainEventModule,
    GeneratorModule,
    SearchModule,
    TokenModule,
    StakeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LockEndpointsMiddleware).forRoutes('*');
  }
}
