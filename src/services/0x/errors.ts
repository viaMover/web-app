export const mapError = (publicErr: string): string => {
  switch (publicErr) {
    case 'INSUFFICIENT_ASSET_LIQUIDITY':
      return 'Cannot execute swap. Not enough liquidity';
    default:
      return publicErr;
  }
};
