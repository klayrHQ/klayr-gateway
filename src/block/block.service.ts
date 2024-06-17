import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventService } from 'src/event/event.service';
import { Asset, Block, RewardAtHeight, Transaction } from 'src/node-api/types';
import { BlockRepoService } from './block-repo.service';
import { NodeApi, NodeApiService } from 'src/node-api/node-api.service';
import { Events, Payload } from 'src/event/types';
import { UpdateBlockFee } from 'src/transaction/transaction.service';
import { TransactionType } from 'src/transaction/types';
import { ValidatorService } from 'src/validator/validator.service';
import { RegisterValidatorParams } from 'src/validator/types';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);

  constructor(
    private blockRepo: BlockRepoService,
    private eventService: EventService,
    private nodeApiService: NodeApiService,
    private validatorService: ValidatorService,
  ) {}

  @OnEvent(Events.NEW_BLOCKS_EVENT)
  public async handleNewBlockEvent(payload: Block[]) {
    this.logger.debug(`Block module: New block event ${payload.at(-1).header.height}`);

    await this.blockRepo.createBlocksBulk(await this.processBlocks(payload));

    await this.eventService.pushToTxAndAssetsEventQ({
      event: Events.NEW_ASSETS_EVENT,
      payload: this.processAssets(payload),
    });

    const transactions = this.processTransactions(payload);
    if (transactions && transactions.length > 0) {
      await this.eventService.pushToTxAndAssetsEventQ({
        event: Events.NEW_TX_EVENT,
        payload: transactions,
      });
    }

    await this.checkForBlockFinality();
    // TODO: emit event events (chain event)
  }

  public async updateBlocksFee(map: Map<number, UpdateBlockFee>): Promise<void> {
    for (const [height, { totalBurnt, totalFee }] of map.entries()) {
      const { reward } = await this.blockRepo.getBlock({ height });
      const networkFee = totalFee - totalBurnt;
      const totalForged = Number(reward) + networkFee + totalBurnt;

      await this.blockRepo.updateBlock({
        where: {
          height: height,
        },
        data: {
          totalBurnt: totalBurnt,
          networkFee: networkFee,
          totalForged: totalForged,
        },
      });
    }
  }

  private async processBlocks(blocks: Block[]): Promise<any[]> {
    const promises = blocks.map(async (block) => {
      const { reward } = await this.nodeApiService.invokeApi<RewardAtHeight>(
        NodeApi.REWARD_GET_DEFAULT_REWARD_AT_HEIGHT,
        { height: block.header.height },
      );

      // Handling transaction 'events' here before bulk inserting blocks
      // Only for updating accounts for now
      // TODO: Emit these events to the event service for custom handling
      // TODO: Not sure if this is the right place for that because the TXs & Blocks are not in the DB yet
      if (block.transactions.length > 0) {
        await this.processTransactionEvents(block.transactions);
      }

      return {
        ...block.header,
        reward,
        numberOfTransactions: block.transactions.length,
        numberOfAssets: block.assets.length,
        aggregateCommit: JSON.stringify(block.header.aggregateCommit),
        totalForged: Number(reward),
      };
    });

    return Promise.all(promises);
  }

  // TODO: handle other transaction event types, probably in new modules
  private async processTransactionEvents(txs: Transaction[]) {
    for (const tx of txs) {
      const decodedParams = this.nodeApiService.decodeTxData(tx.module, tx.command, tx.params);
      switch (`${tx.module}:${tx.command}`) {
        case TransactionType.POS_REGISTER_VALIDATOR:
          console.log(tx);
          await this.validatorService.processRegisterValidator(
            tx,
            decodedParams as RegisterValidatorParams,
          );
          break;
        default:
          this.logger.warn(`Unhandled transaction event ${tx.module}:${tx.command}`);
          break;
      }
    }
  }

  private processTransactions(blocks: Block[]): Payload<Transaction>[] {
    return blocks
      .filter((block: Block) => block.transactions.length > 0)
      .map((block: Block) => ({
        height: block.header.height,
        data: block.transactions,
      }));
  }

  private processAssets(blocks: Block[]): Payload<Asset>[] {
    return blocks.map((block: Block) => ({
      height: block.header.height,
      data: block.assets,
    }));
  }

  private async checkForBlockFinality() {
    await this.nodeApiService.getAndSetNodeInfo();
    await this.blockRepo.updateManyBlocks({
      where: {
        isFinal: false,
        height: {
          lte: this.nodeApiService.nodeInfo.finalizedHeight,
        },
      },
      data: {
        isFinal: true,
      },
    });
  }
}
