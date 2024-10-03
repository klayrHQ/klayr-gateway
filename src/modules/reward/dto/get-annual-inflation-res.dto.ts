import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAnnualInflationResDto {
  tokenID: string;
  rate: string;
}

export const getAnnualInflationRes: ApiResponseOptions = {
  status: 200,
  description: 'The annual inflation have been successfully fetched.',
  type: GetAnnualInflationResDto,
};
