import { ApiResponseOptions } from '@nestjs/swagger';

class Unlocks {
  validatorAddress: string;
  amount: string;
  unstakeHeight: number;
  unlockable: boolean;
  expectedUnlockableHeight: number;
}

export class GetUnlocksResponseDto {
  address: string;
  publicKey: string;
  name: string;
  pendingUnlocks: Unlocks[];
}

export const getUnlocksResponse: ApiResponseOptions = {
  status: 200,
  description: 'The unlock have been successfully fetched.',
  type: GetUnlocksResponseDto,
};
