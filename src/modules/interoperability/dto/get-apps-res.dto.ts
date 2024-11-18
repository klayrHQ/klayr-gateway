import { ApiResponseOptions } from '@nestjs/swagger';

class Escrow {
  tokenID: string;
  amount: string;
}
export class GetAppsData {
  chainID: string;
  chainName: string;
  status: string;
  address: string;
  lastCertificateHeight: number;
  lastUpdated: number;
  escrowedKLY: string;
  escrow: Escrow[];
}

export class GetAppsMeta {
  total: number;
  limit: number;
  offset: number;
}

export class GetAppsResDto {
  data: GetAppsData[];
  meta: GetAppsMeta;
}

export const getAppsRes: ApiResponseOptions = {
  status: 200,
  description: 'Tokens meta data have been successfully retrieved.',
  type: GetAppsResDto,
};
