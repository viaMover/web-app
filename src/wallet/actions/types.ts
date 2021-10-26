export type CompoundEstimateResponse = {
  error: boolean;
  approveGasLimit: string;
  actionGasLimit: string;
};

export type EstimateResponse = {
  error: boolean;
  gasLimit: string;
};
