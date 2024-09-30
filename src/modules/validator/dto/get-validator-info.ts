import { IsString } from 'class-validator';

export class GetValidatorInfoDto {
  /**
   * Get validator info by address
   */
  @IsString()
  address: string;
}
