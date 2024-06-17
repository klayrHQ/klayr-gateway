import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_BLOCKS_TO_FETCH } from 'src/utils/constants';
import { SortTypes } from 'src/utils/controller-helpers';

export class GetBlocksDto {
  @IsString()
  @IsOptional()
  blockID: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number in a range like "1:20", "1:", or ":20"',
  })
  height: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'timestamp must be a unix in a range like "1000:2000", "1000:", or ":2000"',
  })
  timestamp: string;

  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort: SortTypes = SortTypes.HEIGHT_ASC;

  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit: number = DEFAULT_BLOCKS_TO_FETCH;

  @IsNumber()
  offset: number = 0;

  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  includeAssets: boolean = false;
}
