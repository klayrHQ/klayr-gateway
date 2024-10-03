import { IsNotEmpty, IsString } from 'class-validator';

export class GetDefaultRewardDto {
  /**
   * Block height to query
   */
  @IsString()
  @IsNotEmpty()
  height: string;
}
