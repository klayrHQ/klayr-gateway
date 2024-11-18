import { ApiResponseOptions } from '@nestjs/swagger';

class Block {
  id: string;
  height: number;
  timestamp: number;
}

export class GetEventsData {
  id: number;
  height: number;
  module: string;
  name: string;
  data: object;
  topics: string[];
  index?: number;
  transactionID?: string;
  block: Block;
}

export class GetEventsMeta {
  count: number;
  offset: number;
  total: number;
}

export class GetEventsResDto {
  data: GetEventsData[];
  meta: GetEventsMeta;
}

export const getEventsRes: ApiResponseOptions = {
  status: 200,
  description: 'Events has been successfully retrieved.',
  type: GetEventsResDto,
};
