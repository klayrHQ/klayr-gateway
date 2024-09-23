import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';
import { EventGateway } from './event.gateway';
import { ExecutionResultCommand } from '../commands/execution-result.command';
import { UpdateAccountCommand } from '../commands/update-account.command';
import {
  TokenBurnEvent,
  TokenLockEvent,
  TokenMintEvent,
  TokenTransferEvent,
  TokenUnlockEvent,
} from '../../interfaces/token-events.interface';

export enum TokenEventTypes {
  TOKEN_COMMAND_EXECUTION_RESULT = 'token:commandExecutionResult',
  TOKEN_TRANSFER = 'token:transfer',
  TOKEN_LOCK = 'token:lock',
  TOKEN_UNLOCK = 'token:unlock',
  TOKEN_BURN = 'token:burn',
  TOKEN_MINT = 'token:mint',
}

export class TokenCommandExecutionResult extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    await this.commandBus.execute(new ExecutionResultCommand(event));
  }
}

export class TokenTransfer extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const transferEvent = JSON.parse(event.data as string) as TokenTransferEvent;
    const { recipientAddress, senderAddress, tokenID } = transferEvent;
    await this.commandBus.execute(new UpdateAccountCommand(recipientAddress, tokenID));
    await this.commandBus.execute(new UpdateAccountCommand(senderAddress, tokenID));
  }
}

export class TokenLock extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const lockEvent = JSON.parse(event.data as string) as TokenLockEvent;
    const { address, tokenID } = lockEvent;
    await this.commandBus.execute(new UpdateAccountCommand(address, tokenID));
  }
}

export class TokenUnlock extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const unlockEvent = JSON.parse(event.data as string) as TokenUnlockEvent;
    const { address, tokenID } = unlockEvent;
    await this.commandBus.execute(new UpdateAccountCommand(address, tokenID));
  }
}

export class TokenBurn extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const burnEvent = JSON.parse(event.data as string) as TokenBurnEvent;
    const { address, tokenID } = burnEvent;
    await this.commandBus.execute(new UpdateAccountCommand(address, tokenID));
  }
}

export class TokenMint extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const mintEvent = JSON.parse(event.data as string) as TokenMintEvent;
    const { address, tokenID } = mintEvent;
    await this.commandBus.execute(new UpdateAccountCommand(address, tokenID));
  }
}
