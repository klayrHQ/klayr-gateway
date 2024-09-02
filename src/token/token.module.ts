import { Module } from '@nestjs/common';
import { TokenController } from './token.controller';
import { TokenService } from './token.service';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { AccountModule } from 'src/account/account.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [NodeApiModule, AccountModule, TransactionModule],
  controllers: [TokenController],
  providers: [TokenService],
})
export class TokenModule {}
