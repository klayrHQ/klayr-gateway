import { ApiResponseOptions } from '@nestjs/swagger';

class Account {
  address: string;
  publicKey: string;
  name: string;
}

export class GetValidatorInfoData {
  generatorKey: string;
  blsKey: string;
  proofOfPossession: string;
}

export class GetValidatorInfoResDto {
  data: GetValidatorInfoData;
  meta: Account;
}

export const getValidatorInfoRes: ApiResponseOptions = {
  status: 200,
  description: 'The validator info has been successfully fetched.',
  type: GetValidatorInfoResDto,
};
