import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_TX_TO_FETCH } from 'src/utils/constants';
import { SortTypes } from 'src/utils/controller-helpers';
import { ApiProperty } from '@nestjs/swagger';

export class GetTransactionDto {
  @ApiProperty({ required: false, description: 'Get transaction by transaction ID.' })
  @IsString()
  @IsOptional()
  transactionID: string;

  @ApiProperty({ required: false, description: 'Filter transactions by sender address.' })
  @IsString()
  @IsOptional()
  senderAddress: string;

  @ApiProperty({
    required: false,
    description:
      'Filter transactions by nonce. Nonce is only allowed if senderAddress is supplied as a parameter.',
  })
  @IsString()
  @IsOptional()
  nonce: string;

  @ApiProperty({ required: false, description: 'Filter transactions by address.' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    required: false,
    description: 'Filter transactions by module and command. Format: "module:command".',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z]+:[a-z]+$/, {
    message: 'moduleCommand must have a format "token:transfer"',
  })
  moduleCommand: string;

  @ApiProperty({
    required: false,
    description: `Limit the number of transactions fetched. Default is ${DEFAULT_TX_TO_FETCH}.`,
  })
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit: number = DEFAULT_TX_TO_FETCH;

  @ApiProperty({ required: false, description: 'Filter transactions by block ID.' })
  @IsString()
  @IsOptional()
  blockID: string;

  @ApiProperty({
    required: false,
    description:
      'Filter transactions by height. Format: "height", "start:end", "start:" or ":end".',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number in a range like "1:20", "1:", or ":20"',
  })
  height: string;

  @ApiProperty({
    required: false,
    description:
      'Filter transactions by timestamp. Format: "timestamp", "start:end", "start:" or ":end".',
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'timestamp must be a unix in a range like "1000:2000", "1000:", or ":2000"',
  })
  timestamp: string;

  @ApiProperty({
    required: false,
    description: 'Sort transactions. Default is "height:asc".',
    enum: SortTypes,
  })
  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort: SortTypes = SortTypes.HEIGHT_ASC;

  @ApiProperty({
    required: false,
    description: 'Offset for the transactions fetched. Default is 0.',
  })
  @IsNumber()
  offset: number = 0;
}
