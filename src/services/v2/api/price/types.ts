export type CachedPrice = {
  value: {
    [currency: string]: string;
  };
  expirationTimestampMs: number;
};
