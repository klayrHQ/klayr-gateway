import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ChainEvents, Events, GatewayEvents, Payload } from 'src/event/types';
import { ChainEvent, Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';
import { Prisma } from '@prisma/client';
import { getKlayr32AddressFromPublicKey } from 'src/utils/helpers';
import { EventService } from 'src/event/event.service';
import { ExecutionEventData, ExecutionStatus } from './types';

export interface UpdateBlockFee {
  totalBurnt: number;
  totalFee: number;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private nodeApiService: NodeApiService,
    private transactionRepoService: TransactionRepoService,
    private eventService: EventService,
  ) {}

  @OnEvent(Events.NEW_TX_EVENT)
  public async handleTransactionEvent(payload: Payload<Transaction>[]) {
    this.logger.debug('New TX event');
    let totalBurntPerBlock = new Map<number, UpdateBlockFee>();

    const txInput = await Promise.all(
      payload.flatMap(({ height, data: txs }) =>
        txs.map((tx, i) => this.createTransaction({ tx, height, index: i, totalBurntPerBlock })),
      ),
    );

    await this.transactionRepoService.createTransactionsBulk(txInput);

    await this.eventService.pushToGeneralEventQ({
      event: GatewayEvents.UPDATE_BLOCK_FEE,
      payload: totalBurntPerBlock,
    });
  }

  // TODO: known issue: errors when token transfer fails because transaction is not found. This is because the account create event is not emitted on a failed tx so the tx is not inserted.
  @OnEvent(ChainEvents.POS_COMMAND_EXECUTION_RESULT)
  public async handleExecutionResult(payload: ChainEvent) {
    const executionStatus =
      payload.data === ExecutionEventData.SUCCESSFUL
        ? ExecutionStatus.SUCCESSFUL
        : ExecutionStatus.FAILED;

    await this.transactionRepoService.updateTransaction(
      { id: payload.transactionID },
      { executionStatus },
    );
  }

  private async createTransaction(params: {
    tx: Transaction;
    height: number;
    index: number;
    totalBurntPerBlock: Map<number, UpdateBlockFee>;
  }): Promise<Prisma.TransactionCreateManyInput> {
    const { tx, height, index, totalBurntPerBlock } = params;
    const txParams = this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params);

    return {
      id: tx.id,
      height,
      signatures: JSON.stringify(tx.signatures),
      module: tx.module,
      command: tx.command,
      nonce: tx.nonce,
      fee: tx.fee,
      minFee: this.calcFeePerBlock(totalBurntPerBlock, height, tx),
      senderAddress: getKlayr32AddressFromPublicKey(tx.senderPublicKey),
      recipientAddress: txParams['recipientAddress'] || null,
      index,
      params: JSON.stringify(txParams),
    };
  }

  private calcFeePerBlock(
    map: Map<number, UpdateBlockFee>,
    height: number,
    tx: Transaction,
  ): string {
    const txMinFee = this.calculateMinFee(tx);
    const currentBlockFee = map.get(height) || { totalBurnt: 0, totalFee: 0 };
    map.set(height, {
      totalBurnt: currentBlockFee.totalBurnt + Number(txMinFee),
      totalFee: currentBlockFee.totalFee + Number(tx.fee),
    });

    return txMinFee;
  }

  private calculateMinFee(tx: Transaction): string {
    return this.nodeApiService.calcMinFee({
      ...tx,
      senderPublicKey: tx.senderPublicKey,
      signatures: tx.signatures,
      params: tx.params,
    });
  }
}
