import { Module } from '@nestjs/common';
import { BlockEventService } from './block-event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from './block-repo.service';
import { BlockController } from './block.controller';

@Module({
  providers: [PrismaService, BlockEventService, BlockRepoService],
  controllers: [BlockController],
})
export class BlockModule {}
