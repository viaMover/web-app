export const isProviderRpcError = (
  error: unknown
): error is ProviderRpcError => {
  if (!(error instanceof Object)) {
    return false;
  }

  const candidate = error as Partial<ProviderRpcError>;
  return !(candidate.message === undefined || candidate.code === undefined);
};

export interface ProviderRpcError extends Error {
  code: number;
  data?: unknown;
}
