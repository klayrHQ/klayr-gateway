import { Module } from '@nestjs/common';
import { BlockEventService } from './block-event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockRepoService } from './block-repo.service';
import { BlockController } from './block.controller';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [EventModule],
  providers: [PrismaService, BlockEventService, BlockRepoService],
  controllers: [BlockController],
})
export class BlockModule {}
