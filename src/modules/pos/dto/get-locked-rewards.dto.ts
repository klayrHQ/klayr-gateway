import { IsOptional, IsString } from 'class-validator';

export class GetLockedRewardsDto {
  /**
   * The address of the account
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * The public key of the account
   */
  @IsString()
  @IsOptional()
  publicKey?: string;

  /**
   * The name of the account
   */
  @IsString()
  @IsOptional()
  name?: string;
}
