export type Result<T, E extends string, P = void> =
  | ErrorResult<E, P>
  | SuccessResult<T>;

export type ErrorResult<E extends string, P = void> = {
  isError: true;
  error: E;
  shortError?: E;
  payload?: P;
};

export type SuccessResult<T> = {
  isError: false;
  result: T;
};

export const isError = <T, E extends string, P>(
  res: Result<T, E, P>
): res is ErrorResult<E, P> => {
  return res.isError;
};

export const isSuccess = <T, E extends string, P>(
  res: Result<T, E, P>
): res is SuccessResult<T> => {
  return !res.isError;
};
