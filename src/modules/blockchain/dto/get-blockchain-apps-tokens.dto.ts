import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlockChainTokensSortTypes } from 'src/utils/controller-helpers';

export class GetBlockchainTokensMetaDto {
  /**
   * Chain name to query. Supports case-insensitive chain name.
   */
  @IsString()
  @IsOptional()
  chainName?: string;

  /**
   * Chain ID to query (can be expressed as CSV).
   */
  @IsString()
  @IsOptional()
  chainID?: string;

  /**
   * Token name to query (can be expressed as CSV).
   */
  @IsString()
  @IsOptional()
  tokenName?: string;

  /**
   * Token ID to query (can be expressed as CSV).
   */
  @IsString()
  @IsOptional()
  tokenID?: string;

  /**
   * Network for which the application metadata is to be queried (can be expressed as CSV).
   * Accepted values: mainnet, testnet, betanet, devnet.
   */
  @IsString()
  @IsOptional()
  @Matches(/^(mainnet|testnet|betanet|devnet)(,(mainnet|testnet|betanet|devnet))*$/, {
    message: 'network must be one of the following values: mainnet, testnet, betanet, devnet',
  })
  network?: string;

  /**
   * Case-insensitive search by token name. Supports both partial and full text search.
   */
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Limit to apply to the query results.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsOptional()
  limit?: number = 10;

  /**
   * Offset to apply to the query results.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsOptional()
  offset?: number = 0;

  /**
   * Fields to sort results by.
   */
  @IsString()
  @IsEnum(BlockChainTokensSortTypes, {
    message:
      'sort must be one of the following values: ' +
      Object.values(BlockChainTokensSortTypes).join(', '),
  })
  sort?: BlockChainTokensSortTypes = BlockChainTokensSortTypes.TOKEN_ID_ASC;
}
