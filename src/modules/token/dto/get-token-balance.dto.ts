import { IsNotEmpty, IsString } from 'class-validator';

export class GetTokenBalanceDto {
  /**
   * Address of the account to query
   */
  @IsString()
  @IsNotEmpty()
  address: string;
}
