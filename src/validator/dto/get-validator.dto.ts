import { IsNotEmpty, IsString } from 'class-validator';

export class ValidatorQueryDto {
  /**
   * The address of the validator
   */
  @IsString()
  @IsNotEmpty()
  address: string;
}
