export enum Modules {
  INDEXER = 'indexer',
}

export enum IndexerState {
  START_UP,
  RESTART,
  SYNCING,
  INDEXING,
  PROCESSING_BLOCKS,
}
