import { ChainEvent } from './chain-event.interface';
import { ValidatorEventService } from './validator/validator-event.service';

export enum ChainEventTypes {
  DYNAMIC_REWARD_REWARD_MINTED = 'dynamicReward:rewardMinted',
  VALIDATORS_GENERATOR_KEY_REGISTRATION = 'validators:generatorKeyRegistration',
  VALIDATORS_BLS_KEY_REGISTRATION = 'validators:blsKeyRegistration',
  POS_VALIDATOR_REGISTERED = 'pos:validatorRegistered',
  POS_VALIDATOR_STAKED = 'pos:validatorStaked',
  POS_VALIDATOR_BANNED = 'pos:validatorBanned',
  POS_VALIDATOR_PUNISHED = 'pos:validatorPunished',
  POS_COMMISSION_CHANGE = 'pos:commissionChange',
  POS_REWARDS_ASSIGNED = 'pos:rewardsAssigned',
  POS_COMMAND_EXECUTION_RESULT = 'pos:commandExecutionResult',
  TOKEN_COMMAND_EXECUTION_RESULT = 'token:commandExecutionResult',
  INTEROPERABILITY_COMMAND_EXECUTION_RESULT = 'interoperability:commandExecutionResult',
  FEE_INSUFFICIENT_FEE = 'fee:insufficientFee',
  FEE_GENERATOR_FEE_PROCESSED = 'fee:generatorFeeProcessed',
}

export abstract class ChainEventGateway {
  constructor(protected validatorEventService: ValidatorEventService) {}

  abstract processChainEvent(event: ChainEvent): Promise<void>;
}

export class ValidatorRegistered extends ChainEventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { address } = JSON.parse(event.data as string);
    await this.validatorEventService.handleValidatorEvent(address);
  }
}

export class ValidatorStaked extends ChainEventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { validatorAddress } = JSON.parse(event.data as string);
    await this.validatorEventService.handleValidatorEvent(validatorAddress);
  }
}

export class ValidatorCommissionChange extends ChainEventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { validatorAddress } = JSON.parse(event.data as string);
    await this.validatorEventService.handleValidatorEvent(validatorAddress);
  }
}

export class ValidatorBanned extends ChainEventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { address } = JSON.parse(event.data as string);
    await this.validatorEventService.handleValidatorEvent(address);
  }
}

export class ValidatorPunished extends ChainEventGateway {
  async processChainEvent(event: ChainEvent): Promise<void> {
    const { address } = JSON.parse(event.data as string);
    await this.validatorEventService.handleValidatorEvent(address);
  }
}
