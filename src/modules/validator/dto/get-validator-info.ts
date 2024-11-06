import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetValidatorInfoDto {
  /**
   * Get validator info by address
   */
  @ApiProperty({
    description: 'Klayr account address.',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
