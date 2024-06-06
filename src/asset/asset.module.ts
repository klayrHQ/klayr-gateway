import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { EventModule } from 'src/event/event.module';
import { AssetRepoService } from './asset-repo.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [EventModule],
  providers: [PrismaService, AssetService, AssetRepoService],
})
export class AssetModule {}
