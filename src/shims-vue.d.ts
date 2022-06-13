import { default as GlobalStore } from '@/store';
import { Network } from '@/utils/networkTypes';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

type StoreType = typeof GlobalStore;

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    currentNetwork: Network;
    baseAsset: SmallTokenInfoWithIcon & { name: string };
    formatAsCrypto(value: string | number, decimals = 4): string;
    formatAsCryptoWithSymbol(
      value: string | number,
      symbol: string,
      decimals = 4
    ): string;
    formatAsNativeCurrency(
      value: string | number,
      forceFullCurrency?: boolean
    ): string;
    formatAsNativeCurrencyWithOptionalSign(
      value: string | number,
      sign: string,
      forceFullCurrency?: boolean
    ): string;
    $store: StoreType;
  }
}
