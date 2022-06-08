export type Methods = 'ankr_getAccountBalance'; // list of rpc functions that we use

export type AnkrNetwork =
  | 'arbitrum'
  | 'avalanche'
  | 'bsc'
  | 'eth'
  | 'fantom'
  | 'polygon';

export type JsonRPCRBasicPart = {
  jsonrpc: '2.0';
  id: number | string;
};

export type Request = JsonRPCRBasicPart & {
  method: 'ankr_getAccountBalance';
  params: GetAccountBalanceRequestArgs;
};

export type GetAccountBalanceRequestArgs = {
  blockchain: AnkrNetwork[];
  walletAddress: string;
};

export type Response<T extends Result> = SuccessResponse<T> | ErrorResponse;

export type SuccessResponse<T extends Result> = JsonRPCRBasicPart & {
  result: T;
};

export type ErrorResponse = JsonRPCRBasicPart & {
  error: ErrorResult;
};

export const isError = <T extends Result>(
  res: Response<T>
): res is ErrorResponse => {
  return 'error' in res;
};

export type ErrorResult = {
  code: number;
  message: string;
};

export type GetAccountBalanceResult = {
  totalBalanceUsd: string;
  assets: Array<GetAccountBalanceResultAsset>;
};

export type GetAccountBalanceResultAsset = {
  blockchain: AnkrNetwork;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenType: string;
  contractAddress: string;
  holderAddress: string;
  balance: string;
  balanceRawInteger: string;
  balanceUsd: string;
  tokenPrice: string;
  thumbnail: string;
};

export type Result = ErrorResult | GetAccountBalanceResult;
