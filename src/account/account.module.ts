import { Module } from '@nestjs/common';
import { AccountRepoService } from './account-repo.service';
import { AccountService } from './account.service';

@Module({
  providers: [AccountRepoService, AccountService],
  exports: [AccountService, AccountRepoService],
})
export class AccountModule {}
