import { IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_TX_TO_FETCH } from 'src/utils/constants';
import { SortTypes } from 'src/utils/controller-helpers';

export class GetTransactionDto {
  /**
   * Get transaction by transaction ID.
   */
  @IsString()
  @IsOptional()
  transactionID?: string;

  /**
   * Filter transactions by sender address.
   */
  @IsString()
  @IsOptional()
  senderAddress?: string;

  /**
   * Filter transactions by nonce. Nonce is only allowed if senderAddress is supplied as a parameter.
   */
  @IsString()
  @IsOptional()
  nonce?: string;

  /**
   * Filter transactions by address.
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Filter transactions by module and command. Format: "module:command".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[a-z]+:[a-z]+$/, {
    message: 'moduleCommand must have a format "token:transfer"',
  })
  moduleCommand?: string;

  /**
   * Limit the number of transactions fetched. Default is ${DEFAULT_TX_TO_FETCH}.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_TX_TO_FETCH;

  /**
   * Filter transactions by block ID.
   */
  @IsString()
  @IsOptional()
  blockID?: string;

  /**
   * Filter transactions by height. Format: "height", "start:end", "start:" or ":end".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'height must be a number in a range like "1:20", "1:", or ":20"',
  })
  height?: string;

  /**
   * Filter transactions by timestamp. Format: "timestamp", "start:end", "start:" or ":end".
   */
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]+:([0-9]*)?$|^:[0-9]+$/, {
    message: 'timestamp must be a unix in a range like "1000:2000", "1000:", or ":2000"',
  })
  timestamp?: string;

  /**
   * Sort transactions. Default is "height:asc".
   */
  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort?: SortTypes = SortTypes.HEIGHT_ASC;

  /**
   * Offset for the transactions fetched. Default is 0.
   */
  @IsNumber()
  offset?: number = 0;
}
