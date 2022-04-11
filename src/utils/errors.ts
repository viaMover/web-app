export const errorToString = (error: any): string => {
  if (error) {
    if (typeof error.message === 'string') {
      return error.message;
    }
    return String(error);
  }
  return '';
};

export enum CommonErrors {
  OTHER_PROVIDER_CONNECT_ERROR = 1,
  CACHED_PROVIDER_CONNECT_ERROR = 2,
  INIT_WALLET_ERROR = 3,
  ADD_ETH_CHAIN_ERROR = 4,
  SWITCH_ETH_CHAIN_ERROR = 5,
  WC_PROVIDER_INIT_ERROR = 6,
  OTHER_PROVIDER_INIT_ERROR = 7
}
