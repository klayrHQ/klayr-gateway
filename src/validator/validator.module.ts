import { Module } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { ValidatorService } from './validator.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidatorController } from './validator.controller';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [AccountModule],
  providers: [ValidatorRepoService, ValidatorService, PrismaService],
  exports: [ValidatorService],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
