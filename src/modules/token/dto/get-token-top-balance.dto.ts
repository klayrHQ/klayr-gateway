import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TopBalanceSortTypes } from 'src/utils/controller-helpers';

export class GetTokenTopBalanceDto {
  /**
   * Address of the account to query
   */
  @IsString()
  @IsNotEmpty()
  tokenID: string;

  /**
   * Limit to apply to the query results.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = 10; // TODO constant

  /**
   * Offset to apply to the query results.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;

  /**
   * Fields to sort results by.
   */
  @IsString()
  @IsEnum(TopBalanceSortTypes, {
    message:
      'sort must be one of the following values: ' + Object.values(TopBalanceSortTypes).join(', '),
  })
  sort?: TopBalanceSortTypes = TopBalanceSortTypes.TOTAL_BALANCE_DESC;
}
