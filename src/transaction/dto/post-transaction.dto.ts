import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostTransactionDto {
  @ApiProperty({
    description: 'signed transaction string',
    example: '01234abcd',
  })
  @IsString()
  @IsNotEmpty()
  transaction: string;
}
