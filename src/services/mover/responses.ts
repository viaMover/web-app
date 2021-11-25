export type SuccessfulResponse<T> = {
  status: 'ok';
  payload: T;
};
export type ErrorResponse = {
  status: 'error';

  // short service explanation
  errorCode: string;

  // user-friendly error message which can be displayed
  error: string;
};

export type MoverResponse<T> = SuccessfulResponse<T> | ErrorResponse;
