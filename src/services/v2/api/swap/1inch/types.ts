export type OneInchToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
};

export type TokensResponse = {
  tokens: Array<OneInchToken>;
};

export type Protocol = {
  name: string;
  part: number;
  fromTokenAddress: string;
  toTokenAddress: string;
};

// @see https://docs.1inch.io/docs/aggregation-protocol/api/quote-params#description-of-query-parameters
export type QuoteParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  // default: all. Encoding?
  protocols?: string;
  // min: 0, max: 3, default: 0
  fee?: string | number;
  gasLimit?: string | number;
  // max: 5
  connectorTokens?: string | number;
  // default: 10, max: 50
  mainRouteParts?: number;
  // default: 50, max: 100
  parts?: number;
  // default: fast gas from network
  gasPrice?: string | number;
};

// @see https://docs.1inch.io/docs/aggregation-protocol/api/quote-params#description-of-response-parameters
export type QuoteResponse = {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: Array<Protocol>;
  estimatedGas: number;
};

export type OneInchTx = {
  from: string;
  to: string;
  data: string;
  value: string;
  gasPrice: string;
  gas: string;
};

// @see https://docs.1inch.io/docs/aggregation-protocol/api/swap-params#description-of-response-parameters
export type SwapResponse = {
  fromToken: OneInchToken;
  toToken: OneInchToken;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: Array<Protocol> | Array<Array<Protocol>>;
  tx: OneInchTx;
};

// @see https://docs.1inch.io/docs/aggregation-protocol/api/swap-params#description-of-query-parameters
export type SwapParams = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  fromAddress: string;
  // min: 0, max: 50. Percents?
  slippage: string | number;
  // default: all. Encoding?
  protocols?: string;
  // default: fromAddress
  destReceived?: string;
  referrerAddress?: string;
  // min: 0, max: 3, default: 0
  fee?: string | number;
  // default: fast gas from network
  gasPrice?: string | number;
  // should be always false?
  disableEstimate?: boolean;
  // permit string
  // @see https://eips.ethereum.org/EIPS/eip-2612
  permit?: string;
  // default: false
  // Suggest checking user's balance and allowance before set this flag; CHI should be approved to spender address
  burnChi?: boolean;
  allowPartialFill?: boolean;
  // default: 50, max: 100
  parts?: number;
  // default: 10, max: 50
  mainRouteParts?: number;
  // max: 5
  connectorTokens?: string | number;
  // min: 0, max: 3, default: 2
  complexityLevel?: string | number;
  gasLimit?: string | number;
};

export type OneInchBadRequestResponse = {
  statusCode: number;
  error: string;
  description: string;
  requestId: string;
  meta: Array<{
    type: string;
    value: string | number;
  }>;
};
