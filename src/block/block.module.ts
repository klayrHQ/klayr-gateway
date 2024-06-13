import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from './block-repo.service';
import { BlockController } from './block.controller';
import { EventModule } from 'src/event/event.module';
import { NodeApiModule } from 'src/node-api/node-api.module';
import { ValidatorModule } from 'src/validator/validator.module';

@Module({
  imports: [EventModule, NodeApiModule, ValidatorModule],
  providers: [PrismaService, BlockService, BlockRepoService],
  controllers: [BlockController],
  exports: [BlockService],
})
export class BlockModule {}
