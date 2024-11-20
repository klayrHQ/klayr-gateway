import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_ACCOUNTS_TO_FETCH } from 'src/utils/constants';

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
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_ACCOUNTS_TO_FETCH;

  /**
   * Offset for the accounts fetched.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
