import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAnnualInflationData {
  tokenID: string;
  rate: string;
}

export class GetAnnualInflationMeta {}

export class GetAnnualInflationResDto {
  data: GetAnnualInflationData;
  meta: GetAnnualInflationMeta;
}

export const getAnnualInflationRes: ApiResponseOptions = {
  status: 200,
  description: 'The annual inflation have been successfully fetched.',
  type: GetAnnualInflationResDto,
};
