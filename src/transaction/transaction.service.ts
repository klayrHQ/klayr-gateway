import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, GatewayEvents, Payload } from 'src/event/types';
import { Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';
import { AccountService } from 'src/account/account.service';
import { Prisma } from '@prisma/client';
import { getKlayr32AddressFromPublicKey } from 'src/utils/helpers';
import { EventService } from 'src/event/event.service';

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
    private accountService: AccountService,
    private eventService: EventService,
  ) {}

  @OnEvent(Events.NEW_TX_EVENT)
  public async handleTransactionEvent(payload: Payload<Transaction>[]) {
    this.logger.debug('New TX event');
    let totalBurntPerBlock = new Map<number, UpdateBlockFee>();

    // const txInput = await Promise.all(
    //   payload.flatMap(({ height, data: txs }) =>
    //     txs.map((tx, i) => this.createTransaction({ tx, height, index: i, totalBurntPerBlock })),
    //   ),
    // );
    // TODO: The map above is causing race conditions in the `updateOrCreateAccount` method.
    // TODO: Not too happy with this solution yet.
    const txInput = [];
    for (const { height, data: txs } of payload) {
      for (const [index, tx] of txs.entries()) {
        const result = await this.createTransaction({ tx, height, index, totalBurntPerBlock });
        txInput.push(result);
      }
    }

    await this.transactionRepoService.createTransactionsBulk(txInput);

    await this.eventService.pushToGeneralEventQ({
      event: GatewayEvents.UPDATE_BLOCK_FEE,
      payload: totalBurntPerBlock,
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
