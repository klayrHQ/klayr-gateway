import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_BLOCKS_TO_FETCH } from 'src/utils/constants';
import { SortTypes } from 'src/utils/controller-helpers';
import { ApiProperty } from '@nestjs/swagger';
export class GetBlocksDto {
  @ApiProperty({
    name: 'blockID',
    required: false,
    description: 'Get block by block ID.',
  })
  @IsString()
  @IsOptional()
  blockID: string;

  @ApiProperty({
    name: 'height',
    required: false,
    description: 'Filter blocks by height. Format: "height", "start:end", "start:" or ":end".',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number in a range like "1:20", "1:", or ":20"',
  })
  height: string;

  @ApiProperty({
    name: 'timestamp',
    required: false,
    description:
      'Filter blocks by timestamp. Format: "timestamp", "start:end", "start:" or ":end".',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'timestamp must be a unix in a range like "1000:2000", "1000:", or ":2000"',
  })
  timestamp: string;

  @ApiProperty({
    name: 'sort',
    required: false,
    description: 'Sort blocks. Default is "height:asc".',
    enum: SortTypes,
  })
  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort: SortTypes = SortTypes.HEIGHT_ASC;

  @ApiProperty({
    name: 'limit',
    required: false,
    description: `Limit the number of blocks fetched. Default is ${DEFAULT_BLOCKS_TO_FETCH}.`,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit: number = DEFAULT_BLOCKS_TO_FETCH;

  @ApiProperty({
    name: 'offset',
    required: false,
    description: 'Offset for the blocks fetched. Default is 0.',
  })
  @IsNumber()
  offset: number = 0;

  @ApiProperty({
    name: 'includeAssets',
    required: false,
    description: 'Include assets in the blocks fetched. Default is false.',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  includeAssets: boolean = false;
}
