import { Controller, Get, Param } from '@nestjs/common';
import { BlockRepoService } from './block-repo.service';
import { Block as BlockModel } from '@prisma/client';

@Controller('block')
export class BlockController {
  constructor(private readonly blockRepoService: BlockRepoService) {}

  @Get(':height')
  async getBlockByID(@Param('height') height: string): Promise<BlockModel> {
    return this.blockRepoService.getBlock({ height: Number(height) });
  }
}
