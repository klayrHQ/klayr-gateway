import { ApiResponseOptions } from '@nestjs/swagger';

class Account {
  address: string;
  publicKey: string;
  name: string;
}

export class GetAuthData {
  nonce: string;
  numberOfSignatures: number;
  mandatoryKeys: string[];
  optionalKeys: string[];
}

export class GetAuthResDto {
  data: GetAuthData;
  meta: Account;
}

export const getAuthRes: ApiResponseOptions = {
  status: 200,
  description: 'The auth response have been successfully fetched.',
  type: GetAuthResDto,
};
