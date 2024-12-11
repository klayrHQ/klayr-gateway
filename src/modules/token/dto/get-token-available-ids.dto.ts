import { IsEnum, IsNumber, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { AccountSortTypes, AvailableIdsSortTypes } from 'src/utils/controller-helpers';

export class GetTokenAvailableIdsDto {
  /**
   * Sort available token IDs.
   */
  @IsString()
  @IsEnum(AvailableIdsSortTypes, {
    message:
      'sort must be one of the following values: ' + Object.values(AccountSortTypes).join(', '),
  })
  sort?: AvailableIdsSortTypes = AvailableIdsSortTypes.TOKEN_ID_DESC;

  /**
   * Limit the number of available ids fetched.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = 10;

  /**
   * Offset for the  available ids fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
