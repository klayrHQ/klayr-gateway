export class CacheService<T> {
  private cache: T[] = [];
  private batchSize: number;
  private onBatchFull: (items: T[]) => Promise<void>;

  constructor(batchSize: number, onBatchFull: (items: T[]) => Promise<void>) {
    this.batchSize = batchSize;
    this.onBatchFull = onBatchFull;
  }

  public async add(item: T): Promise<void> {
    this.cache.push(item);

    if (this.cache.length >= this.batchSize) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    const items = this.cache.splice(0, this.batchSize);
    await this.onBatchFull(items);
  }
}
