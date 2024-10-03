import { IsNotEmpty, IsString } from 'class-validator';

export class GetAnnualInflationDto {
  /**
   * Block height to query
   */
  @IsString()
  @IsNotEmpty()
  height: string;
}
