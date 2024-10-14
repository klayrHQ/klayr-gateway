import { ApiResponseOptions } from '@nestjs/swagger';

class FeeEstimatePerByte {
  low: number;
  medium: number;
  high: number;
}

export class GetFeesResDto {
  feeEstimatePerByte: FeeEstimatePerByte;
  feeTokenID: string;
  minFeePerByte: number;
}

export const getFeesResponse: ApiResponseOptions = {
  status: 200,
  description: 'Fees has been successfully retrieved.',
  type: GetFeesResDto,
};
