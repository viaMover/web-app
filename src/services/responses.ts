export type Result<T> = {
  isError: boolean;
  result: T | undefined;
  errorMessage: string;
};
