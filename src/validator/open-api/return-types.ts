import { ApiResponseOptions } from '@nestjs/swagger';

import { ApiProperty } from '@nestjs/swagger';

export class GetValidatorResponse {
  @ApiProperty()
  address: string;

  @ApiProperty()
  name: string;

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
