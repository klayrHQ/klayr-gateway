import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { EventModule } from 'src/event/event.module';
import { AssetRepoService } from './asset-repo.service';

@Module({
  imports: [EventModule],
  providers: [AssetService, AssetRepoService],
})
export class AssetModule {}
