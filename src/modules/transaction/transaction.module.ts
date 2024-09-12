import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { NodeApiModule } from 'src/modules/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  providers: [],
  controllers: [TransactionController],
})
export class TransactionModule {}
