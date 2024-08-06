import { Module } from '@nestjs/common';
import { DbCacheService } from './db-cache.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [PrismaService, DbCacheService],
  exports: [DbCacheService],
})
export class DbCacheModule {}
