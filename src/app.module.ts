import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerModule } from './modules/indexer/indexer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NodeApiModule } from './modules/node-api/node-api.module';
import { BlockModule } from './modules/block/block.module';
import { ValidatorModule } from './modules/pos/validator.module';
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
    EventModule,
    GeneratorModule,
    SearchModule,
    TokenModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LockEndpointsMiddleware).forRoutes('*');
  }
}
