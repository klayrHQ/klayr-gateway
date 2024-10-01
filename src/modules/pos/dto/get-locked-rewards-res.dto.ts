import { ApiResponseOptions } from '@nestjs/swagger';

class LockedRewards {
  validatorAddress: string;
  amount: string;
  unstakeHeight: number;
  unlockable: boolean;
  expectedUnlockableHeight: number;
}

export class GetLockedRewardsResponseDto {
  address: string;
  publicKey: string;
  name: string;
  pendingUnlocks: LockedRewards[];
}

export const getLockedRewardsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The locked rewards have been successfully fetched.',
  type: GetLockedRewardsResponseDto,
};
