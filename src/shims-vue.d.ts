import { Network, NetworkInfo } from '@/utils/networkTypes';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vue/types/vue' {
  interface Vue {
    networkInfo: NetworkInfo | undefined;
    currentNetwork: Network;
    baseAsset: SmallTokenInfoWithIcon & { name: string };
    formatAsNativeCurrency(value: string | number): string;
  }
}
