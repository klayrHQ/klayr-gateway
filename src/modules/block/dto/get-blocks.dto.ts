import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_BLOCKS_TO_FETCH } from 'src/config/constants';
import { SortTypes } from 'src/utils/controller-helpers';

export class GetBlocksDto {
  /**
   * Get block by block ID.
   */
  @IsString()
  @IsOptional()
  blockID?: string;

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
   * Filter blocks by timestamp. Format: "timestamp", "start:end", "start:" or ":end".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'timestamp must be a unix in a range like "1000:2000", "1000:", or ":2000"',
  })
  timestamp?: string;

  /**
   * Get block by Generator address.
   */
  @IsString()
  @IsOptional()
  generatorAddress?: string;

  /**
   * Sort blocks.
   */
  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort?: SortTypes = SortTypes.HEIGHT_DESC;

  /**
   * Limit the number of blocks fetched.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_BLOCKS_TO_FETCH;

  /**
   * Offset for the blocks fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;

  /**
   * Include assets in the blocks fetched.
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  includeAssets?: boolean = false;
}
