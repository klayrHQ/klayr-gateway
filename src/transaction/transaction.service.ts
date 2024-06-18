import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, Payload } from 'src/event/types';
import { Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';
import { AccountService } from 'src/account/account.service';
import { BlockService } from 'src/block/block.service';
import { Prisma } from '@prisma/client';
import { getKlayer32Address } from 'src/utils/helpers';

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
    private blockService: BlockService,
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
      for (let i = 0; i < txs.length; i++) {
        const tx = txs[i];
        const result = await this.createTransaction({ tx, height, index: i, totalBurntPerBlock });
        txInput.push(result);
      }
    }

    await Promise.all([
      this.transactionRepoService.createTransactionsBulk(txInput),
      this.blockService.updateBlocksFee(totalBurntPerBlock),
    ]);
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

    const [senderAddress] = await Promise.all([
      this.upsertSenderAccount(tx),
      this.upsertRecipientAccount(recipientAddress),
    ]);
    const txMinFee = this.calcFeePerBlock(totalBurntPerBlock, height, tx);

    return {
      id: tx.id,
      height,
      signatures: JSON.stringify(tx.signatures),
      module: tx.module,
      command: tx.command,
      nonce: tx.nonce,
      fee: tx.fee,
      minFee: txMinFee,
      senderAddress,
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

  private async upsertSenderAccount(tx: Transaction) {
    const senderAddress = getKlayer32Address(tx.senderPublicKey);

    // TODO: tx.nonce === '0' can give problems for now because not all txs are handled yet
    // TODO: So it can be that the account is not created yet
    if (tx.nonce === '0') {
      await this.accountService.updateOrCreateAccount({
        address: senderAddress,
        publicKey: tx.senderPublicKey,
      });
    }

    return senderAddress;
  }

  private async upsertRecipientAccount(address: string) {
    if (!address) return;
    await this.accountService.updateOrCreateAccount({ address });
  }
}
