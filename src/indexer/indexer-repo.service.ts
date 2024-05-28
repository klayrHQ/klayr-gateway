import { Injectable, Logger } from '@nestjs/common';
import { NextBlockToSync } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { KEY_NEXT_BLOCK_TO_SYNC } from 'src/utils/constants';

@Injectable()
export class IndexerRepoService {
  private readonly logger = new Logger(IndexerRepoService.name);
  constructor(private prisma: PrismaService) {}

  public async getNextBlockToSync(): Promise<NextBlockToSync> {
    return this.prisma.nextBlockToSync
      .findFirst({
        where: { id: KEY_NEXT_BLOCK_TO_SYNC },
      })
      .catch((error) => {
        this.logger.error('Failed to get next block to sync:');
        throw new Error(error); // re-throw the error after logging
      });
  }

  public async setNextBlockToSync(params: { height: number }): Promise<NextBlockToSync> {
    return this.prisma.nextBlockToSync
      .create({
        data: {
          id: KEY_NEXT_BLOCK_TO_SYNC,
          height: params.height,
        },
      })
      .catch((error) => {
        this.logger.error('Failed to set next block to sync:');
        throw new Error(error); // re-throw the error after logging
      });
  }

  public async updateNextBlockToSync(params: { height: number }): Promise<NextBlockToSync> {
    return this.prisma.nextBlockToSync
      .update({
        data: {
          height: params.height,
        },
        where: { id: KEY_NEXT_BLOCK_TO_SYNC },
      })
      .catch((error) => {
        this.logger.error('Failed to update next block to sync:');
        throw new Error(error); // re-throw the error after logging
      });
  }
}
