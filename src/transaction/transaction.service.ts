import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, Payload } from 'src/event/types';
import { Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';
import { cryptography } from '@klayr/client';
import { AccountService } from 'src/account/account.service';
import { BlockService } from 'src/block/block.service';

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

    const txInput = await Promise.all(
      payload.flatMap(({ height, data: txs }) =>
        txs.map((tx) => this.processTransaction(tx, height, totalBurntPerBlock)),
      ),
    );

    await Promise.all([
      this.transactionRepoService.createTransactionsBulk(txInput),
      this.blockService.updateBlocksFee(totalBurntPerBlock),
    ]);
  }

  private async processTransaction(
    tx: Transaction,
    height: number,
    totalBurntPerBlock: Map<number, UpdateBlockFee>,
  ): Promise<any> {
    const senderAddress = await this.upsertAccount(tx);
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
      params: JSON.stringify(this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params)),
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

  private async upsertAccount(tx: Transaction) {
    const senderAddress = cryptography.address.getKlayr32AddressFromPublicKey(
      Buffer.from(tx.senderPublicKey),
    );

    await this.accountService.upsertAccounts({
      where: { address: senderAddress },
      create: {
        address: senderAddress,
        publicKey: tx.senderPublicKey,
      },
      update: {
        publicKey: tx.senderPublicKey,
      },
    });

    return senderAddress;
  }
}
