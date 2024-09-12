import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './modules/indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './modules/node-api/node-api.module';
import { BlockModule } from './modules/block/block.module';
import { ValidatorModule } from './modules/validator/validator.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AccountModule } from './modules/account/account.module';
import { ChainEventModule } from './modules/chain-event/chain-event.module';
import { ScheduleModule } from '@nestjs/schedule';
import { StateModule } from './modules/state/state.module';
import { GeneratorModule } from './modules/generator/generator.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { SearchModule } from './modules/search/search.module';
import { LokiLoggerModule } from 'nestjs-loki-logger';
import { TokenModule } from './modules/token/token.module';
import { LockEndpointsMiddleware } from './middleware/lock-endpoints.middleware';

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
    ValidatorModule,
    AccountModule,
    IndexerModule,
    ChainEventModule,
    GeneratorModule,
    SearchModule,
    TokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LockEndpointsMiddleware).forRoutes('*');
  }
}
