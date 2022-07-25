import { MoverAPITagService } from '@/services/v2/api/mover/tag';

export type TagStoreState = {
  isLoading: boolean;
  isBannerVisible: boolean;

  tag: string | undefined;
  sig: string | undefined;

  apiService: MoverAPITagService | undefined;
};

export type reserveTagInput = {
  tag: string;
  partner: string | undefined;
};

export type SetTagAndSigArgs = {
  tag: string;
  sig: string;
};
