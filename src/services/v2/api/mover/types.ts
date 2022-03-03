export type SuccessfulResponse<T> = {
  status: 'ok';
  payload: T;
};

export type ErrorResponse<E> = {
  status: 'error';

  // short service explanation
  errorCode: string;

  // user-friendly error message which can be displayed
  error: string;

  payload: E;
};

export type MoverResponse<T, E> = SuccessfulResponse<T> | ErrorResponse<E>;
