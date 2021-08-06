<template>
  <section
    class="general-desktop__menu-wrapper-balance"
    :name="$t('lblBalance')"
  >
    <header-balance-avatar />
    <div class="balance-wrapper">
      <div class="balance-wrapper-title">
        <span class="title">{{ $t('headingBalance') }}</span>
        <context-button
          button-class="button"
          :popover-parent-id="popoverParentId"
        >
          <template v-slot:button>
            <arrow-down-icon class="arrow" stroke="#3C3C4399" />
          </template>
          <span class="address">{{ currentAddressText }}</span>
          <context-button-item
            :text="$t('lblDisconnect')"
            @click="disconnectWallet"
          />
        </context-button>
      </div>
      <span class="balance">{{ balanceNative }}</span>
    </div>
    <nav-bar>
      <nav-bar-item
        navigate-to-name="savings-manage"
        :text="$t('savings.lblSavings')"
      />
      <nav-bar-item
        navigate-to-name="treasury-manage"
        :text="$t('treasury.lblSmartTreasury')"
      />
      <nav-bar-item
        v-if="isFeatureEnabled('isBondsEnabled')"
        navigate-to-name="bonds"
        :text="$t('bonds.lblBonds')"
      />
      <nav-bar-item
        v-if="isFeatureEnabled('isCardEnabled')"
        navigate-to-name="card"
        :text="$t('card.lblCard')"
      />
      <nav-bar-item
        v-if="isFeatureEnabled('isMoreEnabled')"
        navigate-to-name="more"
        :text="$t('lblMore')"
      />
    </nav-bar>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { formatToNative } from '@/utils/format';
import { isFeatureEnabled } from '@/settings';

import { ArrowDownIcon } from '@/components/controls';
import { ContextButton, ContextButtonItem } from '@/components/buttons';
import { NavBar, NavBarItem } from '@/components/controls';
import HeaderBalanceAvatar from './header-balance-avatar.vue';

export default Vue.extend({
  name: 'HeaderBalance',
  components: {
    NavBarItem,
    NavBar,
    ArrowDownIcon,
    HeaderBalanceAvatar,
    ContextButton,
    ContextButtonItem
  },
  data() {
    return {
      popoverParentId: 'header-balance-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', ['entireBalance']),
    ...mapState('account', ['currentAddress']),
    currentAddressText(): string {
      if (this.currentAddress) {
        const val = this.currentAddress as string;
        const cutSize = 4;
        const prefixSize = 2; // 0x...

        return [
          ...val.slice(0, cutSize + prefixSize - 1),
          '...',
          ...val.slice(val.length - cutSize, val.length)
        ].join('');
      }

      return this.$t('btnConnectWallet') as string;
    },
    balanceNative(): string {
      return `$${formatToNative(this.entireBalance)}`;
    }
  },
  methods: {
    isFeatureEnabled,
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
