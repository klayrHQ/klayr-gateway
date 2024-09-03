import { ApiResponseOptions } from '@nestjs/swagger';

export class GetStakesResponseDto {
  stakes: Stake[];
}

export class Stake {
  address: string;
  amount: string;
  name: string;
}

export const getStakesResponse: ApiResponseOptions = {
  status: 200,
  description: 'The stakes have been successfully fetched.',
  type: GetStakesResponseDto,
};
