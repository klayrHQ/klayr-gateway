import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DEFAULT_STAKES_TO_FETCH } from 'src/config/constants';

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

  /**
   * Case-insensitive search by name, address or publicKey. Supports both partial and full text search.
   */
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Limit the number of stakes fetched.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_STAKES_TO_FETCH;

  /**
   * Offset for the stakes fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
