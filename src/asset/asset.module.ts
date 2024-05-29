import { Module } from '@nestjs/common';
import { AssetEventService } from './asset-event.service';
import { EventModule } from 'src/event/event.module';
import { AssetRepoService } from './asset-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [EventModule],
  providers: [PrismaService, AssetEventService, AssetRepoService],
})
export class AssetModule {}
