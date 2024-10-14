import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TransactionParams {
  @IsString()
  @IsNotEmpty()
  recipientAddress: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  tokenID: string;

  @IsString()
  @IsOptional()
  data?: string;
}

class Transaction {
  @IsString()
  @IsNotEmpty()
  module: string;

  @IsString()
  @IsNotEmpty()
  command: string;

  @IsString()
  @IsNotEmpty()
  fee: string;

  @IsString()
  @IsNotEmpty()
  nonce: string;

  @IsString()
  @IsNotEmpty()
  senderPublicKey: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  signatures: string[];

  @ValidateNested()
  @Type(() => TransactionParams)
  params: TransactionParams;
}

export class PostDryRunTransactionDto {
  @IsBoolean()
  @IsOptional()
  skipDecode?: boolean = false;

  @IsBoolean()
  @IsOptional()
  skipVerify?: boolean = false;

  @IsBoolean()
  @IsOptional()
  strict?: boolean = false;

  @ValidateNested()
  @Type(() => Transaction)
  transaction: Transaction;
}
