import { ApiResponseOptions } from '@nestjs/swagger';

class ExtraCommandFees {
  userAccountInitializationFee: string;
  escrowAccountInitializationFee: string;
}

export class GetTokenConstantsResponseDto {
  extraCommandFees: ExtraCommandFees;
}

export const getTokenConstantsResponse: ApiResponseOptions = {
  status: 200,
  description: 'The token constants have been successfully fetched.',
  type: GetTokenConstantsResponseDto,
};
