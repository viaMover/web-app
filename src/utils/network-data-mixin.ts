import Vue from 'vue';
import { mapState } from 'vuex';

import { Network, NetworkInfo } from '@/utils/networkTypes';
import { getBaseAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

export const NetworkDataMixin = Vue.mixin({
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    currentNetwork(): Network {
      return (
        (this.networkInfo as NetworkInfo | undefined)?.network ??
        Network.mainnet
      );
    },
    baseAsset(): SmallTokenInfoWithIcon & { name: string } {
      return getBaseAssetData(this.currentNetwork as Network);
    }
  }
});
