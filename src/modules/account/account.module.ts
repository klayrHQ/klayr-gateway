import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';

@Module({
  providers: [],
  exports: [],
  controllers: [AccountController],
})
export class AccountModule {}
