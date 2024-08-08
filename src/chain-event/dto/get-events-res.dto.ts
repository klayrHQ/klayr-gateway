import { ApiResponseOptions } from '@nestjs/swagger';

class Block {
  id: string;
  height: number;
  timestamp: number;
}

export class GetEventsResDto {
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

export const getEventsResponse: ApiResponseOptions = {
  status: 200,
  description: 'Events has been successfully retrieved.',
  type: GetEventsResDto,
};
