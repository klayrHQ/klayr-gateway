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
import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { MAX_TXS_TO_FETCH } from 'src/utils/constants';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerHelpers, GatewayResponse } from 'src/utils/controller-helpers';
import { Prisma } from '@prisma/client';
import { GetTransactionDto } from './dto/get-transactions.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { GetTransactionsResDto, getTransactionsResponse } from './dto/get-transactions-res.dto';
import {
  PostTransactionResponseDto,
  postTransactionResponse,
} from './dto/post-transaction-res.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PostDryRunResDto, postDryRunResponse } from './dto/post-dry-run-res.dto';
import { PostDryRunTransactionDto } from './dto/post-dry-run.dto';
import { transactions } from '@klayr/client';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @ApiResponse(getTransactionsResponse)
  public async getTransaction(
    @Query() query: GetTransactionDto,
  ): Promise<GatewayResponse<GetTransactionsResDto[]>> {
    const {
      transactionID,
      blockID,
      senderAddress,
      recipientAddress,
      nonce,
      receivingChainID,
      address,
      timestamp,
      moduleCommand,
      limit,
      height,
      executionStatus,
      sort,
      offset,
    } = query;
    if (nonce) this.checkSenderAddress(senderAddress);

    const take = Math.min(limit, MAX_TXS_TO_FETCH);
    const { field, direction } = ControllerHelpers.validateSortParameter(sort);
    const [module, command] = moduleCommand ? moduleCommand.split(':') : [];

    const where: Prisma.TransactionWhereInput & {
      sender?: { address?: string };
      recipient?: { address?: string };
      block?: { id?: string };
    } = {
      ...(transactionID && { id: transactionID }),
      ...(blockID && { block: { id: blockID } }),
      ...(senderAddress && { senderAddress }),
      ...(recipientAddress && { recipientAddress }),
      ...(receivingChainID && { receivingChainID }),
      ...(module && { module }),
      ...(command && { command }),
      ...(nonce && { nonce }),
      ...(height && { height: ControllerHelpers.buildRangeCondition(height) }),
      ...(timestamp && { block: { timestamp: ControllerHelpers.buildRangeCondition(timestamp) } }),
      ...(executionStatus && { executionStatus }),
      ...(address && {
        OR: [{ senderAddress: address }, { recipientAddress: address }],
      }),
    };

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        take,
        orderBy: {
          block: {
            [field]: direction,
          },
        },
        skip: offset,
        include: {
          sender: { select: { address: true, publicKey: true, name: true } },
          recipient: { select: { address: true, publicKey: true, name: true } },
          block: { select: { id: true, height: true, timestamp: true, isFinal: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const transactionRes = transactions.map(this.toGetTransactionResponse);

    return new GatewayResponse(transactionRes, { count: transactions.length, offset, total });
  }

  @Post('dryrun')
  @Post()
  @ApiResponse(postDryRunResponse)
  public async transactionNodeApi(
    @Body() body: PostDryRunTransactionDto,
  ): Promise<PostDryRunResDto> {
    console.log('body', body);
    const test = transactions.getBytes(body.transaction);
    // https://github.com/LiskArchive/lisk-service/blob/60e7328af66997fc9f27285d5434b719aebb16fd/services/blockchain-connector/shared/sdk/encoder.js
    console.log({ test });
    try {
      return await this.nodeApiService.invokeApi(NodeApi.TXPOOL_DRY_RUN_TX, body);
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
        recipient: true;
        block: { select: { id: true; height: true; timestamp: true; isFinal: true } };
      };
    }>,
  ): GetTransactionsResDto {
    const {
      sender,
      recipient,
      params,
      signatures,
      senderAddress,
      recipientAddress,
      receivingChainID,
      height,
      ...rest
    } = transaction;
    const newTransaction: GetTransactionsResDto = {
      ...rest,
      sender,
      recipient,
      receivingChainID,
      params: params,
      signatures: signatures,
    };
    if (!sender.name) delete sender.name;
    if (recipient && !recipient.publicKey) delete recipient.publicKey;
    if (recipient && !recipient.name) delete recipient.name;
    if (!receivingChainID) delete newTransaction.receivingChainID;
    return newTransaction;
  }
}
