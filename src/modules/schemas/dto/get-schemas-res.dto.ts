import { ApiResponseOptions } from '@nestjs/swagger';

class Schema {
  '$id': string;
  type: string;
  properties: object;
  required: string[];
}

export class GetSchemaResponseDto {
  block: Schema;
  header: Schema;
  asset: Schema;
  transaction: Schema;
  event: Schema;
  standardEvent: Schema;
}

export const getSchemaResponse: ApiResponseOptions = {
  status: 200,
  description: 'The schemas have been successfully fetched.',
  type: GetSchemaResponseDto,
};
