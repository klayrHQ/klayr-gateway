import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetRepoService {
  constructor(private prisma: PrismaService) {}

  public async createAssetsBulk(
    assets: Prisma.AssetCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.asset.createMany({
      data: assets,
    });
  }
}
