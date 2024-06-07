import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, isString } from 'class-validator';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { TransactionRepoService } from './transaction-repo.service';
import { Transform } from 'class-transformer';
import { DEFAULT_BLOCKS_TO_FETCH, MAX_TXS_TO_FETCH } from 'src/utils/constants';

class PostTransactionDto {
  @IsString()
  @IsNotEmpty()
  transaction: string;
}

class GetTransactionDto {
  @IsString()
  @IsOptional()
  transactionID: string;

  @IsString()
  @IsOptional()
  senderAddress: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z]+:[a-z]+$/, {
    message: 'moduleCommand must have a format "token:transfer"',
  })
  moduleCommand: string;

  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit: number = DEFAULT_BLOCKS_TO_FETCH;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+(:[0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number or a range like "1:20", "1:", or ":20"',
  })
  height: string;
}

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly transactionRepoService: TransactionRepoService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  // @ApiResponse(getNodeInfoResponse)
  async getTransaction(@Query() query: GetTransactionDto) {
    const { transactionID, senderAddress, moduleCommand, limit, height } = query;
    const take = Math.min(limit, MAX_TXS_TO_FETCH);
    const [module, command] = moduleCommand.split(':');
    console.log(query);
    console.log(take);

    const where = {
      module: module,
      command: command,
    };

    if (height) {
      const [start, end] = height.split(':');
      where['height'] = this.buildCondition(start, end, take);
    }

    const transactions = await this.transactionRepoService.getTransactions({
      where,
      take,
      // orderBy: {
      //   [field]: direction,
      // },
      // skip: offset,
    });

    console.log(transactions);

    // gateway response
    return transactions;
  }

  @Post()
  // @ApiBody(invokeNodeApiBody) TODO
  // @ApiResponse(invokeNodeApiResponse)
  async transactionNodeApi(@Body() body: PostTransactionDto) {
    try {
      return await this.nodeApiService.invokeApi(NodeApi.TXPOOL_POST_TX, body);
    } catch (error) {
      throw new HttpException(
        {
          error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private buildCondition(start: string, end: string, take: number) {
    if (start && end) {
      return {
        gte: Number(start),
        lte: Number(end),
      };
    } else if (start) {
      return {
        gte: Number(start),
      };
    } else if (end) {
      return {
        gt: Number(end) - take,
        lte: Number(end),
      };
    }
  }
}
