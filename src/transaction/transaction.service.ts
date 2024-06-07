import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, Payload } from 'src/event/types';
import { Transaction } from 'src/node-api/types';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private transactionRepoService: TransactionRepoService) {}

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
        senderPublicKey: tx.senderPublicKey,
        params: tx.params,
      })),
    );

    console.log(txInput);

    await this.transactionRepoService.createTransactionsBulk(txInput);
  }
}
