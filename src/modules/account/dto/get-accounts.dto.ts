import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_ACCOUNTS_TO_FETCH } from 'src/config/constants';
import { AccountSortTypes } from 'src/utils/controller-helpers';

export class GetAccountsDto {
  /**
   * Get account by address
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Get account by name
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Get account by public key
   */
  @IsString()
  @IsOptional()
  publicKey?: string;

  /**
   * Limit the number of accounts fetched.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_ACCOUNTS_TO_FETCH;

  /**
   * Offset for the accounts fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
