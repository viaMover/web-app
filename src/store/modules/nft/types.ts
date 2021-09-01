import { StepData } from '@/components/controls/form-loader/types';

export type NFTStoreState = {
  isLoading: boolean;

  modalStep: StepData | undefined;

  UnexpectedMoveTotalAmount: string;
  UnexpectedMoveTotalClaimed: string;
  UnexpectedMoveTotalExchanged: string;
  UnexpectedMoveBalance: string;

  SweetAndSourTotalAmount: string;
  SweetAndSourTotalClaimed: string;
};
