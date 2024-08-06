import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Models, UpdateType } from './types';
import { DB_CACHE_SIZE } from 'src/utils/constants';
import { GatewayEvents } from 'src/event/types';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class DbCacheService {
  private logger = new Logger(DbCacheService.name);
  private cache: UpdateType[] = [];
  private batchSize: number = DB_CACHE_SIZE;

  constructor(private prisma: PrismaService) {}

  public async add(item: UpdateType): Promise<void> {
    this.cache.push(item);

    if (this.cache.length >= this.batchSize) {
      await this.flush();
    }
  }

  public async flush(): Promise<void> {
    this.logger.debug(`Flushing cache with ${this.cache.length} items`);

    const items = this.cache.splice(0, this.batchSize);
    await this.prisma.$transaction(
      items.map((item) => {
        switch (item.model) {
          case Models.VALIDATOR:
            return this.prisma.validator.update({
              where: item.where as Prisma.ValidatorWhereUniqueInput,
              data: item.data as Prisma.ValidatorUpdateInput,
            });
          case Models.TRANSACTION:
            return this.prisma.transaction.update({
              where: item.where as Prisma.TransactionWhereUniqueInput,
              data: item.data as Prisma.TransactionUpdateInput,
            });
          case Models.BLOCK:
            return this.prisma.block.update({
              where: item.where as Prisma.BlockWhereUniqueInput,
              data: item.data as Prisma.BlockUpdateInput,
            });
          default:
            throw new Error('Unknown model type');
        }
      }),
    );
  }

  @OnEvent(GatewayEvents.INDEXER_STATE_CHANGE_INDEXING)
  public async handleStateChange() {
    await this.flush();
  }
}
