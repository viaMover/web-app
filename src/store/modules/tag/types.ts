import { MoverAPITagService } from '@/services/v2/api/mover/tag';

export type TagStoreState = {
  isLoading: boolean;
  isBannerVisible: boolean;

  tag: string | undefined;

  apiService: MoverAPITagService | undefined;
};
