import { IsNotEmpty, IsString } from 'class-validator';

export class GetNFTBalanceDto {
  /**
   * Address of the account to query
   */
  @IsString()
  @IsNotEmpty()
  address: string;
}
