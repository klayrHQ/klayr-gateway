import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_TX_TO_FETCH } from 'src/config/constants';
import { SortTypes } from 'src/utils/controller-helpers';
import { ExecutionStatus } from '../types';

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
   * Filter transactions by recipient address.
   */
  @IsString()
  @IsOptional()
  recipientAddress?: string;

  /**
   * Resolves for both senderAddress and recipientAddress
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Filter transactions by nonce. Nonce is only allowed if senderAddress is supplied as a parameter.
   */
  @IsString()
  @IsOptional()
  nonce?: string;

  /**
   * Filter transactions by receivingChainID.
   */
  @IsString()
  @IsOptional()
  receivingChainID?: string;

  /**
   * Filter transactions by module and command. Format: "module:command". Multiple module:command pairs can be passed as a CSV
   */
  @IsString()
  @IsOptional()
  moduleCommand?: string;

  /**
   * Limit the number of transactions fetched.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
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
   * Query transactions by their executionStatus.
   */
  @IsString()
  @IsOptional()
  @IsEnum(ExecutionStatus, {
    message:
      'executionStatus must be one of the following values: ' +
      Object.values(ExecutionStatus).join(', '),
  })
  executionStatus?: ExecutionStatus;

  /**
   * Sort transactions.
   */
  @IsString()
  @IsEnum(SortTypes, {
    message: 'sort must be one of the following values: ' + Object.values(SortTypes).join(', '),
  })
  sort?: SortTypes = SortTypes.HEIGHT_DESC;

  /**
   * Offset for the transactions fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
