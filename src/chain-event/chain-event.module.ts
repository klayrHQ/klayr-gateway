import { Module } from '@nestjs/common';
import { ChainEventRepoService } from './chain-event-repo.service';
import { ChainEventController } from './chain-event.controller';
import { ChainEventService } from './chain-event.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodeApiModule } from 'src/node-api/node-api.module';

@Module({
  imports: [NodeApiModule],
  providers: [PrismaService, ChainEventRepoService, ChainEventService],
  controllers: [ChainEventController],
  exports: [ChainEventService],
})
export class ChainEventModule {}
