export type JsonRPCRBasicPart = {
  jsonrpc: '2.0';
  id: number | string;
};

export type Request = JsonRPCRBasicPart & {
  method: 'alchemy_getTokenBalances';
  params: GetTokenBalancesRequestArgs;
};

export type GetTokenBalancesRequestArgs = Array<string | string[]>;

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

export type GetTokenBalancesResult = {
  address: string;
  tokenBalances: Array<GetTokenBalancesResultToken>;
};

export type GetTokenBalancesResultToken = {
  contractAddress: string;
  tokenBalance: string | null;
  error: string | null;
};

export type Result = ErrorResult | GetTokenBalancesResult;
