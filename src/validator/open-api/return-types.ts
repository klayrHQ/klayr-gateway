import { ApiResponseOptions } from '@nestjs/swagger';

import { ApiProperty } from '@nestjs/swagger';

// TODO: Move probably
class Account {
  @ApiProperty()
  address: string;

  @ApiProperty()
  publicKey?: string;

  @ApiProperty()
  name?: string;
}

export class GetValidatorResponse {
  @ApiProperty({ type: () => Account, required: true })
  account: Account;

  @ApiProperty()
  blsKey: string;

  @ApiProperty()
  proofOfPossession: string;

  @ApiProperty()
  generatorKey: string;
}

export const getValidatorResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator have been successfully fetched.',
  type: GetValidatorResponse,
  isArray: false,
};
