<template>
  <header class="masthead multichain">
    <section class="account">
      <context-button
        button-class="selector button-like"
        :popover-parent-id="accountButtonParentId"
      >
        <template v-slot:button>
          <span class="title">{{ $t('lblYourWallet') }}</span>
          <arrow-down-icon v-once class="arrow" stroke="#3C3C4399" />
        </template>
        <span class="address">{{ currentAddressText }}</span>
        <context-button-item
          :text="$t('lblDisconnect')"
          @click="disconnectWallet"
        />
      </context-button>
    </section>

    <section class="network">
      <context-button
        button-class="selector button-like"
        :popover-parent-id="networkButtonParentId"
      >
        <template v-slot:button>
          <div class="title">
            <img class="image" src="@/assets/images/ETH.png" />
            {{ currentNetworkInfo.network }}
          </div>
          <arrow-down-icon v-once class="arrow" stroke="#3C3C4399" />
        </template>

        <context-button-item
          v-for="network in allNetworks"
          :key="network.chainId"
          class="item"
          :class="{ active: currentNetworkInfo.chainId === network.chainId }"
        >
          <img class="image" src="@/assets/images/ETH.png" />
          {{ network.network }}
        </context-button-item>
      </context-button>
    </section>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

import { NetworkInfo } from '@/utils/networkTypes';

import { ContextButton, ContextButtonItem } from '@/components/buttons';
import { ArrowDownIcon } from '@/components/controls';

export default Vue.extend({
  name: 'HomeMastheadMultichain',
  components: {
    ContextButton,
    ContextButtonItem,
    ArrowDownIcon
  },
  data() {
    return {
      accountButtonParentId: 'masthead-account-buttons',
      networkButtonParentId: 'masthead-network-buttons'
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo',
      currentAddress: 'currentAddress'
    }),
    currentAddressText(): string {
      if (this.currentAddress) {
        const val = this.currentAddress as string;
        const cutSize = 4;
        const prefixSize = 2; // 0x...

        return [
          ...val.slice(0, cutSize + prefixSize),
          '...',
          ...val.slice(val.length - cutSize, val.length)
        ].join('');
      }

      return this.$t('btnConnectWallet') as string;
    },
    currentNetworkInfo(): NetworkInfo {
      return this.networkInfo;
    },
    allNetworks(): Array<NetworkInfo> {
      return new Array(4).fill(this.networkInfo).map((el, idx) => ({
        ...el,
        chainId: idx === 0 ? el.chainId : idx + 250
      }));
    }
  },
  methods: {
    ...mapActions('account', {
      clearWalletState: 'disconnectWallet'
    }),
    async disconnectWallet(): Promise<void> {
      await this.clearWalletState();
      window.location.reload();
    }
  }
});
</script>
