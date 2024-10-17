import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAppsDto {
  /**
   * Chain ID to query (can be expressed as CSV).
   */
  @IsString()
  @IsOptional()
  chainID?: string;

  /**
   * Chain name to query. Supports case-insensitive chain name.
   */
  @IsString()
  @IsOptional()
  chainName?: string;

  /**
   * Status of the blockchain application. Can be expressed as CSV.
   * Accepted values: 'registered', 'activated', 'terminated', 'unregistered'.
   */
  @IsString()
  @IsOptional()
  @Matches(
    /^(registered|activated|terminated|unregistered)(,(registered|activated|terminated|unregistered))*$/,
    {
      message:
        'network must be one of the following values: registered, activated, terminated, unregistered',
    },
  )
  status?: string;

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
}
