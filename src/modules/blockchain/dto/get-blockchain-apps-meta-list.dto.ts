import { IsEnum, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { BlockchainAppsMetaListTypes } from 'src/utils/controller-helpers';

export class GetBlockchainAppsListDto {
  /**
   * Chain name to query. Supports case-insensitive chain name.
   */
  @IsString()
  @IsOptional()
  chainName?: string;

  /**
   * Network for which the application metadata is to be queried (can be expressed as CSV).
   * Accepted values: mainnet, testnet, betanet, devnet.
   */
  @IsString()
  @IsOptional()
  network?: string;

  /**
   * Case-insensitive search by chain name. Supports both partial and full text search.
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
   * Available values: chainName:asc, chainName:desc
   */
  @IsString()
  @IsEnum(BlockchainAppsMetaListTypes, {
    message:
      'sort must be one of the following values: ' +
      Object.values(BlockchainAppsMetaListTypes).join(', '),
  })
  sort?: BlockchainAppsMetaListTypes = BlockchainAppsMetaListTypes.CHAIN_NAME_ASC;
}
