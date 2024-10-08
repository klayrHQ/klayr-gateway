import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_ACCOUNTS_TO_FETCH } from 'src/utils/constants';
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
   * Sort accounts.
   */
  @IsString()
  @IsEnum(AccountSortTypes, {
    message:
      'sort must be one of the following values: ' + Object.values(AccountSortTypes).join(', '),
  })
  sort?: AccountSortTypes = AccountSortTypes.TOTAL_BALANCE_DESC;

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
