import { Module } from '@nestjs/common';
import { DbCacheService } from './db-cache.service';

@Module({
  providers: [DbCacheService],
  exports: [DbCacheService],
})
export class DbCacheModule {}
