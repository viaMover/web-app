type CacheMapElement<V> = {
  value: V;
  expirationTimestampMs: number;
};

export class InMemoryCacheMap<K, V> {
  private readonly map: Map<K, CacheMapElement<V>>;

  constructor(
    private readonly ttlSeconds: number,
    private readonly fallback: () => Promise<V>
  ) {
    this.map = new Map<K, CacheMapElement<V>>();
  }

  public async get(key: K): Promise<V> {
    const el = this.map.get(key);
    if (el !== undefined && el.expirationTimestampMs > Date.now()) {
      return el.value;
    }

    const val = await this.fallback();
    this.map.set(key, {
      value: val,
      expirationTimestampMs: Date.now() + this.ttlSeconds * 1000
    });
    return val;
  }
}
