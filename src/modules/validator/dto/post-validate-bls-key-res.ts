import { ApiResponseOptions } from '@nestjs/swagger';

export class PostValidateBlsKeyResDto {
  isValid: boolean;
}

export const postValidateBlsKeyRes: ApiResponseOptions = {
  status: 200,
  description: 'boolean representing the validity of the supplied BLS key and Proof of Possession.',
  type: PostValidateBlsKeyResDto,
};
