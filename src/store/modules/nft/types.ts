import { StepData } from '@/components/controls/form-loader/types';

export type NFTStoreState = {
  isLoading: boolean;

  UnexpectedMoveTotalAmount: string;
  UnexpectedMoveTotalClaimed: string;
  UnexpectedMoveTotalExchanged: string;
  UnexpectedMoveBalance: string;

  SweetAndSourTotalAmount: string;
  SweetAndSourTotalClaimed: string;
};
