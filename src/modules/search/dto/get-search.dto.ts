import { IsString } from 'class-validator';

export class SearchQueryDto {
  /**
   * The search query to search in blocks, transactions and validators
   */
  @IsString()
  search: string;
}
