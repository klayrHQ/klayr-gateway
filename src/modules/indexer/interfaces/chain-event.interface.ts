export interface ChainEvent {
  data: string;
  index: number;
  module: string;
  name: string;
  topics: string[];
  height: number;
  transactionID?: string;
}
