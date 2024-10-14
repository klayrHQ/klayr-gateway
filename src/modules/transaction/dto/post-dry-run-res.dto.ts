import { ApiResponseOptions } from '@nestjs/swagger';

export class PostDryRunResDto {
  id: string;
}

export const postDryRunResponse: ApiResponseOptions = {
  status: 200,
  description: 'Successfully posted the dry run transaction.',
  type: PostDryRunResDto,
};
