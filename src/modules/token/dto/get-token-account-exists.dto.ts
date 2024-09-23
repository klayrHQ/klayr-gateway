import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class GetAccountExistsDto {
  /**
   * Address of the account to query
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Public key of the account to query
   */
  @IsString()
  @IsOptional()
  publicKey?: string;

  /**
   * Query account by the registered name
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * Token ID to query
   */
  @IsString()
  @IsNotEmpty()
  @Length(16, 16)
  tokenID: string;
}
