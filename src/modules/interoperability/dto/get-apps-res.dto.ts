import { ApiResponseOptions } from '@nestjs/swagger';

class Escrow {
  tokenID: string;
  amount: string;
}
export class GetAppsResDto {
  chainID: string;
  chainName: string;
  status: string;
  address: string;
  lastCerticateHeight: number;
  lastUpdated: number;
  escrowedKLY: string;
  escrow: Escrow[];
}

export const getAppsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Tokens meta data have been successfully retrieved.',
  type: GetAppsResDto,
  isArray: true,
};
