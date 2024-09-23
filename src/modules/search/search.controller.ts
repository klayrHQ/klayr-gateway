import { Controller, Query, Get, ValidationPipe, UsePipes } from '@nestjs/common';
import { SearchQueryDto } from './dto/get-search.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetSearchResponse, getSearchResponse } from './dto/get-search-res.dto';
import { getKlayr32AddressFromAddress } from 'src/utils/helpers';
import { HEX_ADDRESS_LENGTH } from 'src/utils/constants';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getSearchResponse)
  async getSearchResults(@Query() query: SearchQueryDto): Promise<GetSearchResponse> {
    let { search } = query;

    if (search.length === HEX_ADDRESS_LENGTH) {
      search = getKlayr32AddressFromAddress(search);
    }

    const [blocks, validators, transactions] = await Promise.all([
      this.searchBlocks(search),
      this.searchValidators(search),
      this.searchTransactions(search),
    ]);

    const formattedBlocks = blocks.map((block) => ({
      height: block.height,
      id: block.id,
    }));

    const formattedValidators = validators.map((validator) => ({
      name: validator.account.name,
      address: validator.address,
      publicKey: validator.account.publicKey,
      rank: validator.rank,
    }));

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      sender: transaction.sender.address,
    }));

    return {
      validators: formattedValidators,
      blocks: formattedBlocks,
      transactions: formattedTransactions,
    };
  }

  private async searchTransactions(search: string): Promise<
    Prisma.TransactionGetPayload<{
      include: {
        sender: true;
      };
    }>[]
  > {
    const where: Prisma.TransactionWhereInput = {
      id: { contains: search },
    };

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        sender: true,
      },
    });

    return transactions;
  }

  private async searchValidators(search: string): Promise<
    {
      address: string;
      rank: number;
      account: {
        name: string;
        publicKey: string;
      };
    }[]
  > {
    const where: Prisma.ValidatorWhereInput = {
      OR: [
        { account: { name: { contains: search } } },
        { address: { equals: search } },
        { account: { publicKey: { equals: search } } },
      ],
    };

    const validators = await this.prisma.validator.findMany({
      where,
      select: {
        address: true,
        rank: true,
        account: {
          select: {
            name: true,
            publicKey: true,
          },
        },
      },
    });

    return validators;
  }

  private async searchBlocks(search: string): Promise<{ id: string; height: number }[]> {
    const height = Number(search);
    const where: Prisma.BlockWhereInput = {
      OR: [{ id: { equals: search } }],
    };

    if (!isNaN(height)) {
      where.OR.push({ height: { equals: height } });
    }

    const blocks = await this.prisma.block.findMany({
      where,
      select: {
        id: true,
        height: true,
      },
    });

    return blocks;
  }
}
