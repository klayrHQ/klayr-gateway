import { ApiResponseOptions } from '@nestjs/swagger';

export class GetAccountExistsResponseDto {
  isExists: boolean;
}

export const getAccountExistsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The account have been successfully fetched.',
  type: GetAccountExistsResponseDto,
};
