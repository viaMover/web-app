export const validateName = (value: string): boolean => {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.trim().length === 0) {
    return true;
  }

  return !/\d|_|[^\w\- ']/.test(value.trim());
};
