import { ApiResponseOptions } from '@nestjs/swagger';

class FeeEstimatePerByte {
  low: number;
  medium: number;
  high: number;
}

export class GetFeesData {
  feeEstimatePerByte: FeeEstimatePerByte;
  feeTokenID: string;
  minFeePerByte: number;
}

export class GetFeesMeta {}

export class GetFeesResDto {
  data: GetFeesData;
  meta: GetFeesMeta;
}

export const getFeesResponse: ApiResponseOptions = {
  status: 200,
  description: 'Fees has been successfully retrieved.',
  type: GetFeesResDto,
};
