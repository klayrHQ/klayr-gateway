export enum TransactionEvents {
  COMMAND_EXECUTION_RESULT = 'commandExecutionResult',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

export enum ExecutionEventData {
  SUCCESSFUL = '0801',
  FAILED = '0800',
}

export enum TxEvents {
  POS_STAKE = 'pos:stake',
  POS_REGISTER_VALIDATOR = 'pos:registerValidator',
  POS_CHANGE_COMMISSION = 'pos:changeCommission',
  TOKEN_TRANSFER = 'token:transfer',
}
