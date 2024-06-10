import { Injectable, Logger } from '@nestjs/common';
import { TransactionRepoService } from './transaction-repo.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, Payload } from 'src/event/types';
import { Transaction } from 'src/node-api/types';
import { NodeApiService } from 'src/node-api/node-api.service';
import { cryptography } from '@klayr/client';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private nodeApiService: NodeApiService,
    private transactionRepoService: TransactionRepoService,
    private accountService: AccountService,
  ) {}

  @OnEvent(Events.NEW_TX_EVENT)
  public async createAsset(payload: Payload<Transaction>[]) {
    this.logger.debug('New TX event');

    const txInput = await Promise.all(
      payload.flatMap(({ height, data }) =>
        data.map(async (tx: Transaction) => {
          const senderAddress = await this.upsertAccount(tx);

          return {
            id: tx.id,
            height,
            signatures: JSON.stringify(tx.signatures),
            module: tx.module,
            command: tx.command,
            nonce: tx.nonce,
            fee: tx.fee,
            minFee: null,
            senderPublicKey: tx.senderPublicKey,
            senderAddress,
            params: JSON.stringify(
              this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params),
            ),
          };
        }),
      ),
    );

    txInput.forEach((tx) => {
      tx.minFee = this.nodeApiService.calcMinFee({
        ...tx,
        senderPublicKey: tx.senderPublicKey,
        signatures: JSON.parse(tx.signatures),
        params: JSON.parse(tx.params),
      });
      delete tx.senderPublicKey;
    });

    await this.transactionRepoService.createTransactionsBulk(txInput);
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
