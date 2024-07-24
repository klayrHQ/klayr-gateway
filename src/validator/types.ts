export interface ValidatorRegisteredData {
  name: string;
  address: string;
}

export interface ValidatorStakedData {
  senderAddress: string;
  validatorAddress: string;
  amount: string;
  result: number;
}

export interface BlsKeyRegistrationData {
  proofOfPossession: string;
  blsKey: string;
}

export interface GeneratorKeyRegistration {
  generatorKey: string;
}
