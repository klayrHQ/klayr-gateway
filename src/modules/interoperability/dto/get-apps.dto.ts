import { IsOptional, IsString } from 'class-validator';

export class GetAppsDto {
  /**
   * Get apps by chain ID.
   */
  @IsString()
  @IsOptional()
  chainID?: string;
}
