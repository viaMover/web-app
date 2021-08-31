import { AccountStoreState } from './modules/account/types';
import { IVueI18n } from 'vue-i18n';

export type RootStoreState = {
  appVersion: string;
  i18n: IVueI18n | null;
  account: AccountStoreState | undefined;
};
