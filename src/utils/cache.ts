export class InMemoryCache<T> {
  private value: T | undefined;
  private expirationTimestampMs: number | undefined;

  constructor(
    private readonly ttlSeconds: number,
    private readonly fallback: () => Promise<T>
  ) {}

  public async get(): Promise<T> {
    if (
      this.value !== undefined &&
      this.expirationTimestampMs !== undefined &&
      this.expirationTimestampMs > Date.now()
    ) {
      return this.value;
    }

    const val = await this.fallback();
    this.expirationTimestampMs = Date.now() + this.ttlSeconds * 1000;
    return val;
  }
}
