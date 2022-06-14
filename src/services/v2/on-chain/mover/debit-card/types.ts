export type CompoundEstimateResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
};

export type CompoundEstimateWithUnwrapResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
  unwrapGasLimit: string;
};

export type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};
