export type GasPriceResponse = {
  fastest: number;
  fast: number;
  average: number;
  safeLow: number;

  fastWait: number;
  fastestWait: number;
  avgWait: number;
  safeLowWait: number;

  blockNum: number;
};
