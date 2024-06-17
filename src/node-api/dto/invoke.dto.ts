import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InvokeBodyDto {
  @ApiProperty({
    description: 'Proxy application endpoint invocations via Klayr Gateway.',
    example: 'chain_getBlocksByHeightBetween',
  })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiProperty({
    type: 'object',
    example: { from: 10, to: 15 },
  })
  @IsObject()
  @ValidateNested()
  params: object;
}
