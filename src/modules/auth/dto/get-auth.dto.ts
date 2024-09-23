import { IsNotEmpty, IsString } from 'class-validator';

export class GetAuthDto {
  /**
   * Get auth by Klayr address
   */
  @IsString()
  @IsNotEmpty()
  address: string;
}
