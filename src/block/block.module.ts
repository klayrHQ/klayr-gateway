import { Module } from '@nestjs/common';
import { BlockEventService } from './block-event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from './block-repo.service';
import { BlockController } from './block.controller';
import { EventModule } from 'src/event/event.module';
import { NodeApiModule } from 'src/node-api/node-api.module';

@Module({
  imports: [EventModule, NodeApiModule],
  providers: [PrismaService, BlockEventService, BlockRepoService],
  controllers: [BlockController],
})
export class BlockModule {}
