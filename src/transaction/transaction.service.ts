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
import { AccountService } from 'src/account/account.service';

export interface UpdateBlockFee {
  totalBurnt: number;
  totalFee: number;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly nodeApiService: NodeApiService,
    private readonly transactionRepoService: TransactionRepoService,
    private readonly eventService: EventService,
    private readonly accountService: AccountService,
  ) {}

  public async handleTransactions(payload: Payload<Transaction>[]) {
    this.logger.debug('New TX event');
    let totalBurntPerBlock = new Map<number, UpdateBlockFee>();

    const txInput = await Promise.all(
      payload.flatMap(({ height, data: txs }) =>
        txs.map(
          async (tx, i) =>
            await this.createTransaction({ tx, height, index: i, totalBurntPerBlock }),
        ),
      ),
    );

    await this.transactionRepoService.createTransactionsBulk(txInput);

    await this.eventService.pushToGeneralEventQ({
      event: GatewayEvents.UPDATE_BLOCK_FEE,
      payload: totalBurntPerBlock,
    });
  }

  @OnEvent(ChainEvents.POS_COMMAND_EXECUTION_RESULT)
  public async handlePosCommandExecutionResult(payload: ChainEvent) {
    await this.handleExecutionResult(payload);
  }

  @OnEvent(ChainEvents.TOKEN_COMMAND_EXECUTION_RESULT)
  public async handleTokenCommandExecutionResult(payload: ChainEvent) {
    await this.handleExecutionResult(payload);
  }

  private async handleExecutionResult(payload: ChainEvent) {
    const executionStatus =
      payload.data === ExecutionEventData.SUCCESSFUL
        ? ExecutionStatus.SUCCESSFUL
        : ExecutionStatus.FAILED;

    await this.transactionRepoService.updateTransaction({
      where: { id: payload.transactionID },
      data: { executionStatus },
    });
  }

  private async createTransaction(params: {
    tx: Transaction;
    height: number;
    index: number;
    totalBurntPerBlock: Map<number, UpdateBlockFee>;
  }): Promise<Prisma.TransactionCreateManyInput> {
    const { tx, height, index, totalBurntPerBlock } = params;
    const txParams = this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params);

    const recipientAddress = txParams['recipientAddress'] || null;
    const senderAddress = getKlayr32AddressFromPublicKey(tx.senderPublicKey);

    await this.handleAccounts(tx, senderAddress, recipientAddress);

    return {
      id: tx.id,
      height,
      signatures: JSON.stringify(tx.signatures),
      module: tx.module,
      command: tx.command,
      nonce: tx.nonce,
      fee: tx.fee,
      minFee: this.calcFeePerBlock(totalBurntPerBlock, height, tx),
      senderAddress: senderAddress,
      recipientAddress,
      index,
      params: JSON.stringify(txParams),
    };
  }

  private async handleAccounts(
    tx: Transaction,
    senderAddress: string,
    recipientAddress: string | null,
  ): Promise<void> {
    if (tx.nonce === '0') {
      await this.accountService.updateOrCreateAccount({
        address: senderAddress,
        publicKey: tx.senderPublicKey,
      });
    }

    // When a tx fails the recipient account is not created / registered. This is to cover that
    if (recipientAddress) {
      await this.accountService.createAccount({
        address: recipientAddress,
      });
    }
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
