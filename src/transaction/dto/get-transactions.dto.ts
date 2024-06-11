import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_TX_TO_FETCH } from 'src/utils/constants';

export class GetTransactionDto {
  @IsString()
  @IsOptional()
  transactionID: string;

  @IsString()
  @IsOptional()
  senderAddress: string;

  @IsString()
  @IsOptional()
  nonce: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z]+:[a-z]+$/, {
    message: 'moduleCommand must have a format "token:transfer"',
  })
  moduleCommand: string;

  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit: number = DEFAULT_TX_TO_FETCH;

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
  sort: string = 'height:asc';

  @IsNumber()
  offset: number = 0;
}
