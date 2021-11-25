export type Result<T, E extends string> = ErrorResult<E> | SuccessResult<T>;

export type ErrorResult<E extends string> = {
  isError: true;
  error: E;
  shortError?: E;
};

export type SuccessResult<T> = {
  isError: false;
  result: T;
};

export const isError = <T, E extends string>(
  res: Result<T, E>
): res is ErrorResult<E> => {
  return res.isError;
};

export const isSuccess = <T, E extends string>(
  res: Result<T, E>
): res is SuccessResult<T> => {
  return !res.isError;
};
