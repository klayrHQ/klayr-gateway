import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_VALIDATORS_TO_FETCH } from 'src/config/constants';

export class GeneratorQueryDto {
  /**
   * Case-insensitive search by name, address or publicKey. Supports both partial and full text search.
   */
  @IsString()
  @IsOptional()
  search?: string;

  /**
   * Limit the number of generators fetched.
   */
  @IsNumber()
  @Min(1, { message: 'limit must be a positive number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_VALIDATORS_TO_FETCH;

  /**
   * Offset for the generators fetched.
   */
  @IsNumber()
  @Min(0, { message: 'offset must be a non-negative number' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
