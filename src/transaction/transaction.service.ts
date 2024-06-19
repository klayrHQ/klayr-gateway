import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, GatewayEvents, Payload, TxEvents } from 'src/event/types';
import { Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';
import { AccountService } from 'src/account/account.service';
import { Prisma } from '@prisma/client';
import { getKlayer32Address } from 'src/utils/helpers';
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

    this.eventService.pushToGeneralEventQ({
      event: GatewayEvents.UPDATE_BLOCK_FEE,
      payload: totalBurntPerBlock,
    });

    // ! emit events after txs are saved
    // TODO: can this be done in the same loop as createTransaction above?
    payload.forEach(({ data }) => {
      data.forEach((tx) => {
        tx.decodedParams = this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params);
        // TODO: this will be removed and go to the chain-event module
        this.eventService.pushToGeneralEventQ({
          event: `${tx.module}:${tx.command}` as TxEvents,
          payload: tx,
        });
      });
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
    // TODO: Is this the best place and will this cover all cases?
    // TODO: Recipient to initializeUserAccount event
    const recipientAddress = txParams['recipientAddress'] || null;
    await this.upsertRecipientAccount(recipientAddress);

    return {
      id: tx.id,
      height,
      signatures: JSON.stringify(tx.signatures),
      module: tx.module,
      command: tx.command,
      nonce: tx.nonce,
      fee: tx.fee,
      minFee: this.calcFeePerBlock(totalBurntPerBlock, height, tx),
      senderAddress: getKlayer32Address(tx.senderPublicKey),
      recipientAddress,
      index,
      params: JSON.stringify(tx.params),
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

  private async upsertRecipientAccount(address: string) {
    if (!address) return;
    await this.accountService.updateOrCreateAccount({ address });
  }
}
