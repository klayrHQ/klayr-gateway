import { IsNotEmpty, IsString } from 'class-validator';

export class PostTransactionDto {
  @IsString()
  @IsNotEmpty()
  transaction: string;
}
