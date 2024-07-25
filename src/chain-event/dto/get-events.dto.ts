import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { DEFAULT_BLOCKS_TO_FETCH } from 'src/utils/constants';
import { SortTypes } from 'src/utils/controller-helpers';

export class GetEventsDto {
  /**
   * Filter blocks by height. Format: "height", "start:end", "start:" or ":end".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number in a range like "1:20", "1:", or ":20"',
  })
  height?: string;

  /**
   * Get events by transactionID
   */
  @IsString()
  @IsOptional()
  transactionID?: string;

  /**
   * Sort events.
   */
  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort?: SortTypes = SortTypes.HEIGHT_DESC;

  /**
   * Limit the number of events fetched.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_BLOCKS_TO_FETCH;

  /**
   * Offset for the events fetched.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
