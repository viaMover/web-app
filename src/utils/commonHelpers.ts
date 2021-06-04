export const isMobileDevice = (): boolean => {
  if (typeof window.matchMedia !== 'undefined') {
    return window.matchMedia('only screen and (max-width: 768px)').matches;
  }

  return false;
};
