import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAppsStatsData {
  registered: number;
  activated: number;
  terminated: number;
  totalSupplyKLY: string;
  totalStakedKLY: string;
  currentAnnualInflationRate: string;
}

export class GetAppsStatsMeta {}

export class GetAppsStatsResDto {
  data: GetAppsStatsData;
  meta: GetAppsStatsMeta;
}

export const getAppsStatsRes: ApiResponseOptions = {
  status: 200,
  description: 'Blockchain applications statistics have been successfully retrieved.',
  type: GetAppsStatsResDto,
};
