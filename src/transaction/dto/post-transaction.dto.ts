import { IsNotEmpty, IsString } from 'class-validator';

export class PostTransactionDto {
  /**
   * Signed transaction string
   * @example '01234abcd'
   */
  @IsString()
  @IsNotEmpty()
  transaction: string;
}
