import { ApiResponseOptions } from '@nestjs/swagger';

export class GetGeneratorData {
  name: string;
  address: string;
  publicKey: string;
  nextAllocatedTime: number;
  status: string;
}

export class GetGeneratorMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetGeneratorResDto {
  data: GetGeneratorData[];
  meta: GetGeneratorMeta;
}

export const getGeneratorRes: ApiResponseOptions = {
  status: 200,
  description: 'The Generator have been successfully fetched.',
  type: GetGeneratorResDto,
};
