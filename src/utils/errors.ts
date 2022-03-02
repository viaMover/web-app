export const errorToString = (error: any): string => {
  if (error) {
    if (typeof error.message === 'string') {
      return error.message;
    }
    return String(error);
  }
  return '';
};
