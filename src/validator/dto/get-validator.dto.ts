import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_VALIDATORS_TO_FETCH } from 'src/utils/constants';

export class ValidatorQueryDto {
  /**
   * The address of the validator
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * Limit the number of validators fetched.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  limit?: number = DEFAULT_VALIDATORS_TO_FETCH;

  /**
   * Offset for the validators fetched.
   */
  @IsNumber()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  offset?: number = 0;
}
