import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/prisma/prisma.service';
import { NodeApiService } from 'src/node-api/node-api.service';
import { LokiLogger } from 'nestjs-loki-logger';
import { Block, Transaction } from '../../interfaces/block.interface';
import { Payload } from 'src/event/types';
import { TxEvents, UpdateBlockFee } from '../../interfaces/transaction.interface';
import { getKlayr32AddressFromPublicKey } from 'src/utils/helpers';
import { Prisma } from '@prisma/client';

export class IndexTransactionCommand implements ICommand {
  constructor(public readonly blocks: Block[]) {}
}

@CommandHandler(IndexTransactionCommand)
export class IndexTransactionHandler implements ICommandHandler<IndexTransactionCommand> {
  private readonly logger = new LokiLogger(IndexTransactionHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodeApi: NodeApiService,
  ) {}

  async execute(command: IndexTransactionCommand): Promise<Map<number, UpdateBlockFee>> {
    this.logger.debug('Indexing transactions...');
    const transactions = this.getTransactionsOutOfBlocks(command.blocks);

    const { accounts, processedTxs, totalBurntPerBlock } =
      await this.processTransactions(transactions);
    if (!processedTxs || processedTxs.length === 0) return new Map();

    await this.upsertAccounts(accounts);

    await this.prisma.transaction.createMany({
      data: processedTxs,
    });

    return totalBurntPerBlock;
  }

  private getTransactionsOutOfBlocks(blocks: Block[]): Payload<Transaction>[] {
    return blocks
      .filter((block: Block) => block.transactions.length > 0)
      .map((block: Block) => ({
        height: block.header.height,
        data: block.transactions,
      }));
  }

  private async processTransactions(payload: Payload<Transaction>[]) {
    const totalBurntPerBlock = new Map<number, UpdateBlockFee>();
    const accounts = new Map<string, { publicKey: string; nonce: string }>();

    const processedTxs = await Promise.all(
      payload.flatMap(({ height, data: txs }) =>
        txs.map(
          async (tx, i) =>
            await this.createTransaction({
              tx,
              height,
              index: i,
              totalBurntPerBlock,
              accounts,
            }),
        ),
      ),
    );

    return { processedTxs, accounts, totalBurntPerBlock };
  }

  private async createTransaction(params: {
    tx: Transaction;
    height: number;
    index: number;
    totalBurntPerBlock: Map<number, UpdateBlockFee>;
    accounts: Map<string, { publicKey?: string; nonce?: string }>;
  }): Promise<Prisma.TransactionCreateManyInput> {
    const { tx, height, index, totalBurntPerBlock, accounts } = params;
    const txParams: any = this.nodeApi.decodeTxData(tx.module, tx.command, tx.params);

    const recipientAddress =
      txParams?.recipientAddress || txParams?.stakes?.[0]?.validatorAddress || null;
    const senderAddress = getKlayr32AddressFromPublicKey(tx.senderPublicKey);

    const existingAccount = accounts.get(senderAddress);
    if (!existingAccount || Number(tx.nonce) > Number(existingAccount.nonce || 0)) {
      accounts.set(senderAddress, { publicKey: tx.senderPublicKey, nonce: tx.nonce });
    }

    if (recipientAddress && !accounts.get(recipientAddress)) accounts.set(recipientAddress, {});

    // TODO: this is not complete because validators are added after all txs, but decent quick solution which covers 80% +
    if (`${tx.module}:${tx.command}` === TxEvents.POS_STAKE) {
      await this.handlePosStake(txParams);
    }

    return {
      id: tx.id,
      height,
      signatures: tx.signatures,
      module: tx.module,
      command: tx.command,
      nonce: tx.nonce,
      fee: tx.fee,
      minFee: this.calcFeePerBlock(totalBurntPerBlock, height, tx),
      senderAddress: senderAddress,
      recipientAddress,
      index,
      params: txParams,
    };
  }

  private async upsertAccounts(accounts: Map<string, { publicKey?: string; nonce?: string }>) {
    const accountArray = Array.from(accounts.entries());

    await Promise.all(
      accountArray.map(async ([address, { publicKey, nonce }]) => {
        await this.prisma.account.upsert({
          where: { address },
          update: { publicKey, nonce },
          create: { address, publicKey, nonce },
        });
      }),
    );
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
    return this.nodeApi.calcMinFee({
      ...tx,
      senderPublicKey: tx.senderPublicKey,
      signatures: tx.signatures,
      params: tx.params,
    });
  }

  private async handlePosStake(txParams: any): Promise<void> {
    await Promise.all(
      txParams.stakes.map(
        async (stake: { validatorAddress: string; amount: string; name?: string }) => {
          const account = await this.prisma.account.findUnique({
            where: { address: stake.validatorAddress },
          });
          if (account.name) stake.name = account.name;
        },
      ),
    );
  }
}
