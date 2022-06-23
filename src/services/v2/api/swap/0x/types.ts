export type SwapQuoteParams = {
  // The ERC20 token address or symbol of the token you want to send. `ETH` can be provided as a valid `sellToken`.
  sellToken: string;
  // The ERC20 token address or symbol of the token you want to receive. `ETH` can be provided as a valid `buyToken`
  buyToken: string;
  // (Optional) The maximum acceptable slippage of the `buyToken` amount if `sellAmount` is provided, the maximum acceptable slippage of the sellAmount amount if buyAmount is provided. E.g `0.03` for `3%` slippage allowed. Should be a number between 0 and 1
  slippagePercentage?: string;
  // (Optional, defaults to ethgasstation "fast") The target gas price (in wei) for the swap transaction. If the price is too low to achieve the quote, an error will be returned.
  gasPrice?: string;
  // (Optional) The address which will fill the quote. When provided the gas will be estimated and returned and the entire transaction will be validated for success. If the validation fails a Revert Error will be returned in the response.
  takerAddress?: string;
  // (Optional) Liquidity sources (Uniswap, SushiSwap, 0x, Curve etc) that will not be included in the provided quote. Ex: excludedSources=Uniswap,SushiSwap,Curve. See here for a full list of sources
  excludedSources?: Array<string>;
  // (Optional) For now only supports RFQT, which should be used when the integrator only wants RFQT liquidity without any other DEX orders. Requires a particular agreement with the 0x integrations team. This parameter cannot be combined with excludedSources.
  includedSources?: Array<string>;
  // (Optional) Normally, whenever a takerAddress is provided, the API will validate the quote for the user. (For more details, see "How does takerAddress help with catching issues?".) When this parameter is set to true, that validation will be skipped. See also here.
  skipValidation?: boolean;
  // (Optional) Used to enable RFQ-T liquidity. For more details see the guide Understanding RFQ-T and the 0x API.
  intentOnFilling?: boolean;
  // (Optional) The ETH address that should receive affiliate fees specified with buyTokenPercentageFee.
  feeRecipient?: string;
  // (Optional) The percentage (between 0 - 1.0) of the buyAmount that should be attributed to feeRecipient as affiliate fees. Note that this requires that the feeRecipient parameter is also specified in the request.
  buyTokenPercentageFee?: string;
  // (Optional) An ETH address for which to attribute the trade for tracking and analytics purposes. Note affiliateAddress is only for tracking trades and has no impact on affiliate fees, for affiliate fees use feeRecipient.
  affiliateAddress?: string;
} & (
  | {
      // The amount of sellToken (in sellToken base units) you want to send. Should be whole number
      sellAmount: string;
      // (Optional) The amount of buyToken (in buyToken base units) you want to receive. Should be whole number
      buyAmount?: string;
    }
  | {
      // (Optional) The amount of sellToken (in sellToken base units) you want to send. Should be whole number
      sellAmount?: string;
      // The amount of buyToken (in buyToken base units) you want to receive. Should be whole number
      buyAmount: string;
    }
);

type SwapQuoteSourceItem = {
  name: string;
  proportion: string;
};

export type SwapQuoteResponse = {
  // The target contract address for which the user needs to have an allowance in order to be able to complete the swap. For swaps with "ETH" as sellToken, wrapping "ETH" to "WETH" or unwrapping "WETH" to "ETH" no allowance is needed, a null address of 0x0000000000000000000000000000000000000000 is then returned instead.
  allowanceTarget: string;
  // The amount of buyToken (in buyToken units) that would be bought in this swap. Certain on-chain sources do not allow specifying buyAmount, when using buyAmount these sources are excluded.
  buyAmount: string;
  // The ERC20 token address of the token you want to receive in quote.
  buyTokenAddress: string;
  buyTokenToEthRate: string;
  chainId: number;
  // The call data required to be sent to the to contract address.
  data: string;
  // The estimate for the amount of gas that will actually be used in the transaction. Always less than gas.
  estimatedGas: string;
  estimatedPriceImpact: string;
  // The estimated gas limit that should be used to send the transaction to guarantee settlement. While a computed estimate is returned in all responses, an accurate estimate will only be returned if a takerAddress is included in the request.
  gas: string;
  // The gas price (in wei) that should be used to send the transaction. The transaction needs to be sent with this gasPrice or lower for the transaction to be successful.
  gasPrice: string;
  // The price which must be met or else the entire transaction will revert. This price is influenced by the slippagePercentage parameter. On-chain sources may encounter price movements from quote to settlement.
  guaranteedPrice: string;
  // The minimum amount of ether that will be paid towards the protocol fee (in wei) during the transaction.
  minimumProtocolFee: string;
  // If buyAmount was specified in the request it provides the price of buyToken in sellToken and vice versa. This price does not include the slippage provided in the request above, and therefore represents the best possible price.
  price: string;
  // The maximum amount of ether that will be paid towards the protocol fee (in wei), and what is used to compute the value field of the transaction.
  protocolFee: string;
  // The amount of sellToken (in sellToken units) that would be sold in this swap. Specifying sellAmount is the recommended way to interact with 0xAPI as it covers all on-chain sources.
  sellAmount: string;
  // The ERC20 token address of the token you want to sell with quote.
  sellTokenAddress: string;
  sellTokenToEthRate: string;
  // The percentage distribution of buyAmount or sellAmount split between each liquidity source. Ex: [{ name: '0x', proportion: "0.8" }, { name: 'Kyber', proportion: "0.2"}, ...]
  sources: Array<SwapQuoteSourceItem>;
  // The address of the contract to send call data to.
  to: string;
  // The amount of ether (in wei) that should be sent with the transaction. (Assuming protocolFee is paid in ether).
  value: string;
};

export enum GeneralErrorCode {
  ValidationFailed = 100,
  MalformedJSON = 101,
  OrderSubmissionDisabled = 102,
  Throttled = 103,
  NotImplemented = 104,
  TransactionInvalid = 105
}

export enum ValidationErrorCode {
  RequiredField = 1000,
  IncorrectFormat = 1001,
  InvalidAddress = 1002,
  AddressNotSupported = 1003,
  ValueOutOfRange = 1004,
  InvalidSignatureOrHash = 1005,
  UnsupportedOption = 1006,
  InvalidZeroXOrder = 1007,
  InternalError = 1008,
  TokenNotSupported = 1009,
  FieldInvalid = 1010
}

export enum ValidationErrorReason {
  InsufficientAssetLiquidity = 'INSUFFICIENT_ASSET_LIQUIDITY'
}

type ValidationError = {
  field: string;
  code: ValidationErrorCode;
  reason: string;
};

// https://github.com/0xProject/0x-monorepo/blob/53b5bb16d8b4c9050a46978b6f347ef7595fe103/packages/json-schemas/schemas/relayer_api_error_response_schema.json
export type ZeroXBadRequestResponse = {
  code: GeneralErrorCode;
  reason: string;
  validationErrors?: Array<ValidationError>;
};
