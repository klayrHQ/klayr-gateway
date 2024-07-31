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
