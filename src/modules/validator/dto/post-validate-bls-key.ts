import { IsString } from 'class-validator';

export class PostValidateBlsKeyDto {
  /**
   * blsKey (required): The BLS key
   */
  @IsString()
  blsKey: string;

  /**
   * proofOfPossession (required): The Proof of Possession corresponding to the BLS key.
   */
  @IsString()
  proofOfPossession: string;
}
