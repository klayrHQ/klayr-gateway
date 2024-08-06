import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_VALIDATORS_TO_FETCH } from 'src/utils/constants';

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
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_VALIDATORS_TO_FETCH;

  /**
   * Offset for the generators fetched.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
