import { ApiResponseOptions } from '@nestjs/swagger';

// TODO: Move probably
class Account {
  address: string;
  publicKey?: string;
  name?: string;
}

export class GetValidatorResponseDto {
  account: Account;
  blsKey?: string;
  proofOfPossession?: string;
  generatorKey?: string;
}

export const getValidatorResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator have been successfully fetched.',
  type: GetValidatorResponseDto,
  isArray: false,
};
