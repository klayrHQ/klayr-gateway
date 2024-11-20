import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DEFAULT_VALIDATORS_TO_FETCH } from 'src/config/constants';
import { ValidatorSortTypes } from 'src/utils/controller-helpers';

export class ValidatorQueryDto {
  /**
   * The address of the validator
   */
  @IsString()
  @IsOptional()
  address?: string;

  /**
   * The public key of the validator
   */
  @IsString()
  @IsOptional()
  publicKey?: string;

  /**
   * The name of the validator
   */
  @IsString()
  @IsOptional()
  name?: string;

  /**
   * The status of the validator
   */
  @IsString()
  @IsOptional()
  status?: string;

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

  /**
   * Sort Validators.
   */
  @IsString()
  @IsEnum(ValidatorSortTypes, {
    message:
      'sort must be one of the following values: ' + Object.values(ValidatorSortTypes).join(', '),
  })
  sort?: ValidatorSortTypes = ValidatorSortTypes.COMMISSION_ASC;
}
