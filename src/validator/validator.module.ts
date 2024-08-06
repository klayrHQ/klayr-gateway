import { Module } from '@nestjs/common';
import { ValidatorRepoService } from './validator.repo-service';
import { ValidatorService } from './validator.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidatorController } from './validator.controller';
import { AccountModule } from 'src/account/account.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { StateModule } from 'src/state/state.module';

@Module({
  imports: [StateModule, AccountModule, NodeApiModule],
  providers: [ValidatorRepoService, ValidatorService, PrismaService],
  exports: [ValidatorService, ValidatorRepoService],
  controllers: [ValidatorController],
})
export class ValidatorModule {}
