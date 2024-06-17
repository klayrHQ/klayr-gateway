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
  GetTransactionsRes,
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
  ): Promise<GatewayResponse<GetTransactionsRes[]>> {
    // TODO: recipientAddress query and implementation
    // TODO: receivingChainID query and implementation
    // TODO: executionStatus query and implementation
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
      ...(height && { height: ControllerHelpers.buildRangeCondition(height) }),
      ...(timestamp && { block: { timestamp: ControllerHelpers.buildRangeCondition(timestamp) } }),
    };

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

    const transactionRes = transactions.map(this.toGetTransactionResponse);

    return new GatewayResponse(transactionRes, { count: transactions.length, offset, total });
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

  private toGetTransactionResponse(
    transaction: Prisma.TransactionGetPayload<{
      include: {
        sender: true;
        block: { select: { id: true; height: true; timestamp: true; isFinal: true } };
      };
    }>,
  ): GetTransactionsRes {
    const { sender, params, signatures, senderAddress, height, ...rest } = transaction;
    const newTransaction: GetTransactionsRes = {
      ...rest,
      sender,
      params: JSON.parse(params),
      signatures: JSON.parse(signatures),
    };
    if (!sender.name) delete sender.name;
    return newTransaction;
  }
}
