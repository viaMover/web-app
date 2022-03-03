import { IVueI18n } from 'vue-i18n';

import { CustomError } from 'ts-custom-error';

export const isProviderRpcError = (
  error: unknown
): error is ProviderRpcError => {
  if (!(error instanceof Object)) {
    return false;
  }

  const candidate = error as Partial<ProviderRpcError>;
  return !(candidate.message === undefined || candidate.code === undefined);
};

export default interface ProviderRpcError extends CustomError {
  code: number;
  data?: unknown;
}

export enum ProviderRpcErrorCode {
  InvalidInput = -32000,
  ResourceNotFound = -32001,
  ResourceUnavailable = -32002,
  TransactionRejected = -32003,
  MethodNotSupported = -32004,
  LimitExceeded = -32005,
  Parse = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  Internal = -32603,
  UserRejectedRequest = 4001,
  Unauthorized = 4100,
  UnsupportedMethod = 4200,
  Disconnected = 4900,
  ChainDisconnected = 4901
}

export const mapProviderRpcErrorToMessage = (
  error: ProviderRpcError,
  i18n: IVueI18n
): string | undefined => {
  if (i18n.te(`provider.errors.${error.code}`)) {
    return i18n.t(`provider.errors.${error.code}`) as string;
  }

  return undefined;
};
