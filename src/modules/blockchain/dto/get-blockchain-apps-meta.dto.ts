import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlockchainAppsMetaSortTypes } from 'src/utils/controller-helpers';

export class GetBlockchainMetaDto {
  /**
   * Chain name to query. Supports case-insensitive chain name.
   */
  @IsString()
  @IsOptional()
  chainName?: string;

  /**
   * Display name to query. Supports case-insensitive display name.
   */
  @IsString()
  @IsOptional()
  displayName?: string;

  /**
   * Chain ID to query (can be expressed as CSV).
   */
  @IsString()
  @IsOptional()
  chainID?: string;

  /**
   * Filter default blockchain application.
   */
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isDefault?: boolean;

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
   * Case-insensitive search by chain name or display name. Supports both partial and full text search.
   */
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Limit to apply to the query results.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsOptional()
  limit?: number = 10;

  /**
   * Offset to apply to the query results.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  @IsOptional()
  offset?: number = 0;

  /**
   * Fields to sort results by.
   */
  @IsString()
  @IsEnum(BlockchainAppsMetaSortTypes, {
    message:
      'sort must be one of the following values: ' +
      Object.values(BlockchainAppsMetaSortTypes).join(', '),
  })
  sort?: string = BlockchainAppsMetaSortTypes.CHAIN_NAME_ASC;
}
