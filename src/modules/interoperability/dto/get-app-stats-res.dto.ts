import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAppsStatsResDto {
  registered: number;
  activated: number;
  terminated: number;
  totalSupplyKLY: string;
  totalStakedKLY: string;
  currentAnnualInflationRate: string;
}

export const getAppsStatsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Blockchain applications statistics have been successfully retrieved.',
  type: GetAppsStatsResDto,
};
