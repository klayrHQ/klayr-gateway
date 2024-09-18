import { alwaysTrue, filterValidatorStaked } from './event.filters';
import {
  InteroperabilityCommandExecutionResult,
  InteroperabilityEventTypes,
} from './gateways/interoperability.gateway';
import {
  PosEventTypes,
  PosExecutionResult,
  ValidatorBanned,
  ValidatorCommissionChange,
  ValidatorPunished,
  ValidatorRegistered,
  ValidatorStaked,
} from './gateways/pos.gateway';
import {
  TokenCommandExecutionResult,
  TokenEventTypes,
  TokenTransfer,
} from './gateways/token.gateway';

export const eventGatewayMap = {
  [PosEventTypes.POS_VALIDATOR_REGISTERED]: ValidatorRegistered,
  [PosEventTypes.POS_VALIDATOR_STAKED]: ValidatorStaked,
  [PosEventTypes.POS_COMMISSION_CHANGE]: ValidatorCommissionChange,
  [PosEventTypes.POS_VALIDATOR_BANNED]: ValidatorBanned,
  [PosEventTypes.POS_VALIDATOR_PUNISHED]: ValidatorPunished,
  [PosEventTypes.POS_COMMAND_EXECUTION_RESULT]: PosExecutionResult,
  [TokenEventTypes.TOKEN_COMMAND_EXECUTION_RESULT]: TokenCommandExecutionResult,
  [TokenEventTypes.TOKEN_TRANSFER]: TokenTransfer,
  [InteroperabilityEventTypes.INTEROPERABILITY_COMMAND_EXECUTION_RESULT]:
    InteroperabilityCommandExecutionResult,
};

export const eventFilterMap = {
  [PosEventTypes.POS_VALIDATOR_REGISTERED]: alwaysTrue,
  [PosEventTypes.POS_VALIDATOR_STAKED]: filterValidatorStaked,
  [PosEventTypes.POS_VALIDATOR_BANNED]: alwaysTrue,
  [PosEventTypes.POS_VALIDATOR_PUNISHED]: alwaysTrue,
  [PosEventTypes.POS_COMMISSION_CHANGE]: alwaysTrue,
  [PosEventTypes.POS_COMMAND_EXECUTION_RESULT]: alwaysTrue,
  [TokenEventTypes.TOKEN_COMMAND_EXECUTION_RESULT]: alwaysTrue,
  [TokenEventTypes.TOKEN_TRANSFER]: alwaysTrue,
  [InteroperabilityEventTypes.INTEROPERABILITY_COMMAND_EXECUTION_RESULT]: alwaysTrue,
};
