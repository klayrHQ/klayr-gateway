import { IsOptional, IsString } from 'class-validator';

export class StakesQueryDto {
  /**
   * The address of the staker
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * The public key of the staker
   */
  @IsString()
  @IsOptional()
  publicKey?: string;

  /**
   * The name of the staker
   */
  @IsString()
  @IsOptional()
  name?: string;
}
