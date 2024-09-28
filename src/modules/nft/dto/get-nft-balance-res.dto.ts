import { ApiResponseOptions } from '@nestjs/swagger';

class AttributesArray {
  module: string;
  attributes: string;
}

export class GetNFTBalanceResponseDto {
  id: string;
  attributesArray: AttributesArray[];
  lockingModule: string;
}

export const getNFTbalanceResponse: ApiResponseOptions = {
  status: 200,
  description: 'The nfts have been successfully fetched.',
  type: GetNFTBalanceResponseDto,
  isArray: true,
};
