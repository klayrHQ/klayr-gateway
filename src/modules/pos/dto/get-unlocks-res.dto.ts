import { ApiResponseOptions } from '@nestjs/swagger';

class Unlocks {
  validatorAddress: string;
  amount: string;
  unstakeHeight: number;
  unlockable: boolean;
  expectedUnlockableHeight: number;
}

export class GetUnlocksData {
  address: string;
  publicKey: string;
  name: string;
  pendingUnlocks: Unlocks[];
}

export class GetUnlocksMeta {}

export class GetUnlocksResDto {
  data: GetUnlocksData;
  meta: GetUnlocksMeta;
}

export const getUnlocksRes: ApiResponseOptions = {
  status: 200,
  description: 'The unlock have been successfully fetched.',
  type: GetUnlocksResDto,
};
