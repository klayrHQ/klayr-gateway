import { Module } from '@nestjs/common';
import { AccountRepoService } from './account-repo.service';
import { AccountService } from './account.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, AccountRepoService, AccountService],
  exports: [AccountService, AccountRepoService],
})
export class AccountModule {}
