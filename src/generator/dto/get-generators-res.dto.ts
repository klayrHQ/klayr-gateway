import { ApiResponseOptions } from '@nestjs/swagger';

export class GetGeneratorResponseDto {
  name: string;
  address: string;
  publicKey: string;
  status: string;
}

export const getGeneratorResponse: ApiResponseOptions = {
  status: 200,
  description: 'The Generator have been successfully fetched.',
  type: GetGeneratorResponseDto,
  isArray: false,
};
