export enum ValidatorStatus {
  ACTIVE = 'active',
  INELIGIBLE = 'ineligible',
  STANDBY = 'standby',
  PUNISHED = 'punished',
  BANNED = 'banned',
}

export interface Payload<T> {
  height: number;
  data: T[];
}

export type PosValidatorStaked = {
  senderAddress: string;
  validatorAddress: string;
  amount: string;
  result: number;
};
