export type EtherScanResponse<T> = {
  status: string;
  message: string;
  result: T;
};

export type EtherScanErrorResponse = {
  status: string;
  message: string;
  result: string;
};

export const isErrorResponse = <T>(
  r: EtherScanResponse<T> | EtherScanErrorResponse
): r is EtherScanErrorResponse => {
  return (r as EtherScanErrorResponse).status !== '1';
};
