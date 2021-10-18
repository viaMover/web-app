export type InfuraResponse<T> = {
  jsonrpc: string;
  id: number;
  result: T;
};

export type InfuraErrorResponse = {
  jsonrpc: string;
  id: number;
  error: {
    code: number;
    message: string;
    data: unknown;
  };
};

export enum ErrorCode {
  ErrProjectRateExceeded = -32005
}

export const isErrorResponse = <T>(
  r: InfuraResponse<T> | InfuraErrorResponse
): r is InfuraErrorResponse => {
  return (r as InfuraErrorResponse).error !== undefined;
};
