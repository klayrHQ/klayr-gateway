import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAuthResponseDto {
  nonce: string;
  numberOfSignatures: number;
  mandatoryKeys: string[];
  optionalKeys: string[];
}

export const getAuthResponse: ApiResponseOptions = {
  status: 200,
  description: 'The auth response have been successfully fetched.',
  type: GetAuthResponseDto,
};
