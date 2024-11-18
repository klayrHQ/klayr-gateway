import { ApiResponseOptions } from '@nestjs/swagger';

class Account {
  address: string;
  publicKey: string;
  name: string;
}

export class Stake {
  address: string;
  amount: string;
  name?: string;
}

export class GetStakesData {
  stakes: Stake[];
}

export class GetStakesMeta {
  staker: Account;
}
export class GetStakesResDto {
  data: GetStakesData;
  meta: GetStakesMeta;
}

export class GetStakersData {
  stakers: Stake[];
}

export class GetStakersMeta {
  validator: Account;
}

export class GetStakersResDto {
  data: GetStakersData;
  meta: GetStakersMeta;
}

export const getStakesRes: ApiResponseOptions = {
  status: 200,
  description: 'The stakes have been successfully fetched.',
  type: GetStakesResDto,
};

export const getStakersRes: ApiResponseOptions = {
  status: 200,
  description: 'The stakers have been successfully fetched.',
  type: GetStakersResDto,
};
