import { NodeApi, NodeApiService } from 'src/modules/node-api/node-api.service';
import { EventGateway } from './event.gateway';
import { ProcessValidatorCommand } from '../commands/process-validator.command';
import { ExecutionResultCommand } from '../commands/execution-result.command';
import { CommandBus } from '@nestjs/cqrs';
import { Staker } from 'src/modules/node-api/types';
import { ChainEvent } from 'src/modules/indexer/interfaces/chain-event.interface';
import { AddStakesCommand } from '../commands/add-stakes.command';
import { PosValidatorStaked } from '../types';

export enum PosEventTypes {
  VALIDATORS_GENERATOR_KEY_REGISTRATION = 'validators:generatorKeyRegistration',
  VALIDATORS_BLS_KEY_REGISTRATION = 'validators:blsKeyRegistration',
  POS_VALIDATOR_REGISTERED = 'pos:validatorRegistered',
  POS_VALIDATOR_STAKED = 'pos:validatorStaked',
  POS_VALIDATOR_BANNED = 'pos:validatorBanned',
  POS_VALIDATOR_PUNISHED = 'pos:validatorPunished',
  POS_COMMISSION_CHANGE = 'pos:commissionChange',
  POS_REWARDS_ASSIGNED = 'pos:rewardsAssigned',
  POS_COMMAND_EXECUTION_RESULT = 'pos:commandExecutionResult',

  // not used yet will be moved
  // DYNAMIC_REWARD_REWARD_MINTED = 'dynamicReward:rewardMinted',
  // FEE_INSUFFICIENT_FEE = 'fee:insufficientFee',
  // FEE_GENERATOR_FEE_PROCESSED = 'fee:generatorFeeProcessed',
}

export class ValidatorRegistered extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { address } = JSON.parse(event.data as string);
    await this.commandBus.execute(new ProcessValidatorCommand(address));
  }
}

export class ValidatorCommissionChange extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { validatorAddress } = JSON.parse(event.data as string);
    await this.commandBus.execute(new ProcessValidatorCommand(validatorAddress));
  }
}

export class ValidatorBanned extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { address } = JSON.parse(event.data as string);
    await this.commandBus.execute(new ProcessValidatorCommand(address));
  }
}

export class ValidatorPunished extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { address } = JSON.parse(event.data as string);
    await this.commandBus.execute(new ProcessValidatorCommand(address));
  }
}

export class PosExecutionResult extends EventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    await this.commandBus.execute(new ExecutionResultCommand(event));
  }
}
export class ValidatorStaked extends EventGateway {
  constructor(
    protected commandBus: CommandBus,
    private nodeApi: NodeApiService,
  ) {
    super(commandBus);
  }

  async processChainEvent(event: ChainEvent): Promise<void> {
    const { senderAddress } = JSON.parse(event.data as string) as PosValidatorStaked;
    const stakes = await this.nodeApi.invokeApi<Staker>(NodeApi.POS_GET_STAKER, {
      address: senderAddress,
    });

    for await (const stake of stakes.stakes) {
      await this.commandBus.execute(new ProcessValidatorCommand(stake.validatorAddress));
    }

    await this.commandBus.execute(new AddStakesCommand(senderAddress));
  }
}
