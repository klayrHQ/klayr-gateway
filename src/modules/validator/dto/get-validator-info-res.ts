import { ApiResponseOptions } from '@nestjs/swagger';

export class GetValidatorInfoResDto {
  generatorKey: string;
  blsKey: string;
  proofOfPossession: string;
}

export const getValidatorInfoResponse: ApiResponseOptions = {
  status: 200,
  description: 'The validator info has been successfully fetched.',
  type: GetValidatorInfoResDto,
};
