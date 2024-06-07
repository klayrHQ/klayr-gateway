import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, Payload } from 'src/event/types';
import { Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private nodeApiService: NodeApiService,
    private transactionRepoService: TransactionRepoService,
  ) {}

  @OnEvent(Events.NEW_TX_EVENT)
  public async createAsset(payload: Payload<Transaction>[]) {
    this.logger.debug('New TX event');

    const txInput = payload.flatMap(({ height, data }) =>
      data.map((tx) => ({
        id: tx.id,
        height,
        signatures: JSON.stringify(tx.signatures),
        module: tx.module,
        command: tx.command,
        nonce: tx.nonce,
        fee: tx.fee,
        minFee: '0',
        senderPublicKey: tx.senderPublicKey,
        params: JSON.stringify(this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params)),
      })),
    );

    txInput.forEach((tx) => {
      tx.minFee = this.nodeApiService.calcMinFee({
        ...tx,
        signatures: JSON.parse(tx.signatures),
        params: JSON.parse(tx.params),
      });
    });

    await this.transactionRepoService.createTransactionsBulk(txInput);
  }
}
