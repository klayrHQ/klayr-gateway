import { ApiResponseOptions } from '@nestjs/swagger';

export class PostValidateBlsKeyData {
  isValid: boolean;
}

export class PostValidateBlsKeyMeta {}

export class PostValidateBlsKeyResDto {
  data: PostValidateBlsKeyData;
  meta: PostValidateBlsKeyMeta;
}

export const postValidateBlsKeyRes: ApiResponseOptions = {
  status: 200,
  description: 'boolean representing the validity of the supplied BLS key and Proof of Possession.',
  type: PostValidateBlsKeyResDto,
};
