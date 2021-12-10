import { IVueI18n } from 'vue-i18n';

import { GovernanceStoreState } from '@/store/modules/governance/types';
import { ModalsStoreState } from '@/store/modules/modals/types';
import { NFTStoreState } from '@/store/modules/nft/types';
import { RadarStoreState } from '@/store/modules/radar/types';
import { ShopStoreState } from '@/store/modules/shop/types';

import { AccountStoreState } from './modules/account/types';
import { EarningsStoreState } from './modules/earnings/types';

export interface RootStoreState {
  appVersion: string;
  i18n: IVueI18n | null;

  // rootState members

  account?: AccountStoreState;
  shop?: ShopStoreState;
  nft?: NFTStoreState;
  governance?: GovernanceStoreState;
  radar?: RadarStoreState;
  modals?: ModalsStoreState;
  earnings?: EarningsStoreState;
  // rootState members end
}
