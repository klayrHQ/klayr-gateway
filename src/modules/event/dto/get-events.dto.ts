import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { DEFAULT_BLOCKS_TO_FETCH } from 'src/config/constants';
import { SortTypes } from 'src/utils/controller-helpers';

export class GetEventsDto {
  /**
   * Get events by transactionID
   */
  @IsString()
  @IsOptional()
  transactionID?: string;

  /**
   * Get events by senderAddress
   */
  @IsString()
  @IsOptional()
  senderAddress?: string;

  /**
   * Module name to query
   */
  @IsString()
  @IsOptional()
  module?: string;

  /**
   * Event name to query
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Filter events by blockID.
   */
  @IsString()
  @IsOptional()
  blockID?: string;

  /**
   * Event topic to query (can be expressed as CSV). For performance reasons, we do not allow users to query default topics such as 03.
   */
  @IsString()
  @IsOptional()
  topic?: string;

  /**
   * Filter events by height. Format: "height", "start:end", "start:" or ":end".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number in a range like "1:20", "1:", or ":20"',
  })
  height?: string;

  /**
   * Filter events by timestamp. Format: "timestamp", "start:end", "start:" or ":end".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'timestamp must be a unix in a range like "1000:2000", "1000:", or ":2000"',
  })
  timestamp?: string;

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
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_BLOCKS_TO_FETCH;

  /**
   * Offset for the events fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
