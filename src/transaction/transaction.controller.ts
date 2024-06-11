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
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { TransactionRepoService } from './transaction-repo.service';
import { MAX_TXS_TO_FETCH } from 'src/utils/constants';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  addressQuery,
  blockIDQuery,
  heightQuery,
  limitQuery,
  moduleCommandQuery,
  nonceQuery,
  offsetQuery,
  senderAddressQuery,
  sortQuery,
  timestampQuery,
  transactionBody,
  transactionIDQuery,
} from './open-api/request-types';
import {
  GetTransactions,
  PostTransactionResponse,
  getTransactionsResponse,
  postTransactionResponse,
} from './open-api/return-types';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { Prisma } from '@prisma/client';
import { GetTransactionDto } from './dto/get-transactions.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly transactionRepoService: TransactionRepoService,
  ) {}

  @Get()
  @ApiQuery(offsetQuery)
  @ApiQuery(sortQuery)
  @ApiQuery(timestampQuery)
  @ApiQuery(heightQuery)
  @ApiQuery(blockIDQuery)
  @ApiQuery(limitQuery)
  @ApiQuery(moduleCommandQuery)
  @ApiQuery(addressQuery)
  @ApiQuery(nonceQuery)
  @ApiQuery(senderAddressQuery)
  @ApiQuery(transactionIDQuery)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getTransactionsResponse)
  public async getTransaction(
    @Query() query: GetTransactionDto,
  ): Promise<GatewayResponse<GetTransactions[]>> {
    // TODO: recipient
    // TODO: receivingChainID
    // TODO: executionStatus
    const {
      transactionID,
      blockID,
      senderAddress,
      nonce,
      address,
      timestamp,
      moduleCommand,
      limit,
      height,
      sort,
      offset,
    } = query;
    if (nonce) this.checkSenderAddress(senderAddress);

    const take = Math.min(limit, MAX_TXS_TO_FETCH);
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const [module, command] = moduleCommand ? moduleCommand.split(':') : [];

    const where: Prisma.TransactionWhereInput & {
      sender?: { address?: string };
      block?: { id?: string };
    } = {
      ...(transactionID && { id: transactionID }),
      ...(blockID && { block: { id: blockID } }),
      ...(senderAddress && { senderAddress }),
      ...(address && { sender: { address } }),
      ...(module && { module }),
      ...(command && { command }),
      ...(nonce && { nonce }),
    };

    if (height) {
      const [start, end] = height.split(':');
      where['height'] = ControllerHelpers.buildCondition(start, end);
    }

    if (timestamp) {
      const [start, end] = timestamp.split(':');
      where['block'] = { timestamp: ControllerHelpers.buildCondition(start, end) };
    }

    const [transactions, total] = await Promise.all([
      this.transactionRepoService.getTransactions({
        where,
        take,
        orderBy: {
          [field]: direction,
        },
        skip: offset,
      }),
      this.transactionRepoService.countTransactions({ where }),
    ]);

    transactions.forEach((tx) => {
      tx.params = JSON.parse(tx.params);
      tx.signatures = JSON.parse(tx.signatures);
      delete tx.senderAddress;
      if (!tx.sender.name) delete tx.sender.name;
    });

    return new GatewayResponse(transactions, { count: transactions.length, offset, total });
  }

  @Post()
  @ApiBody(transactionBody)
  @ApiResponse(postTransactionResponse)
  public async transactionNodeApi(
    @Body() body: PostTransactionDto,
  ): Promise<PostTransactionResponse> {
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

  private checkSenderAddress(senderAddress: string) {
    if (!senderAddress) {
      throw new HttpException('senderAddress is required when using nonce', HttpStatus.BAD_REQUEST);
    }
  }
}
