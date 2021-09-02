import { AccountStoreState } from './modules/account/types';
import { IVueI18n } from 'vue-i18n';
import { NFTStoreState } from '@/store/modules/nft/types';
import { ShopStoreState } from '@/store/modules/shop/types';
import { ProposalStoreState } from '@/store/modules/proposal/types';
import { RadarStoreState } from '@/store/modules/radar/types';
import { ModalsStoreState } from '@/store/modules/modals/types';

export interface RootStoreState {
  appVersion: string;
  i18n: IVueI18n | null;

  // rootState members

  account?: AccountStoreState;
  shop?: ShopStoreState;
  nft?: NFTStoreState;
  proposal?: ProposalStoreState;
  radar?: RadarStoreState;
  modals?: ModalsStoreState;
  // rootState members end
}
