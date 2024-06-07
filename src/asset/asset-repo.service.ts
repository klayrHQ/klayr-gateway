import { Injectable } from '@nestjs/common';
import { Asset, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetRepoService {
  constructor(private prisma: PrismaService) {}

  public async getAsset(
    assetWhereUniqueInput: Prisma.AssetWhereUniqueInput,
  ): Promise<Asset | null> {
    return this.prisma.asset.findUnique({
      where: assetWhereUniqueInput,
    });
  }

  public async createAssetsBulk(
    assets: Prisma.AssetCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.asset.createMany({
      data: assets,
    });
  }
}
