import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidatorQueryDto {
  @ApiProperty({
    name: 'address',
    required: true,
    type: String,
    description: 'The address of the validator',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
