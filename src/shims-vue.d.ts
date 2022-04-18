import { Network } from '@/utils/networkTypes';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    currentNetwork: Network;
    baseAsset: SmallTokenInfoWithIcon & { name: string };
    formatAsNativeCurrency(value: string | number): string;
    formatAsNativeCurrencyWithOptionalSign(
      value: string | number,
      sign: string
    ): string;
  }
}
