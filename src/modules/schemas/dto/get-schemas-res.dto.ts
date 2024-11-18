import { ApiResponseOptions } from '@nestjs/swagger';

class Schema {
  '$id': string;
  type: string;
  properties: object;
  required: string[];
}

class ModuleSchema {
  commands: object[];
  events: object[];
  stores: object[];
  endpoints: object[];
  assets: object[];
  name: string;
}

export class GetSchemaData {
  block: Schema;
  header: Schema;
  asset: Schema;
  transaction: Schema;
  event: Schema;
  standardEvent: Schema;
  modules: ModuleSchema[];
}

export class GetSchemaMeta {}

export class GetSchemaResDto {
  data: GetSchemaData;
  meta: GetSchemaMeta;
}

export const getSchemaRes: ApiResponseOptions = {
  status: 200,
  description: 'The schemas have been successfully fetched.',
  type: GetSchemaResDto,
};
