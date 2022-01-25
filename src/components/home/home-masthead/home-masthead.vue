<template>
  <header class="masthead">
    <home-masthead-avatar />

    <section class="title">
      <context-button
        button-class="selector button-like"
        :popover-parent-id="popoverParentId"
      >
        <template v-slot:button>
          <span class="title">{{ $t('headingBalance') }}</span>
          <arrow-down-icon v-once class="arrow" stroke="#3C3C4399" />
        </template>
        <span class="address">{{ currentAddressText }}</span>
        <context-button-item
          :text="$t('lblDisconnect')"
          @click="disconnectWallet"
        />
      </context-button>
      <div class="balance">{{ balanceNative }}</div>
    </section>

    <home-masthead-nav-bar>
      <home-masthead-nav-bar-item
        navigate-to-name="savings-manage"
        :text="$t('savings.lblSavings')"
      />

      <home-masthead-nav-bar-item
        navigate-to-name="treasury-manage"
        :text="$t('treasury.lblSmartTreasury')"
      />

      <home-masthead-nav-bar-item
        v-if="isFeatureEnabled('isEarningsEnabled')"
        navigate-to-name="earnings-manage"
        :text="$t('earnings.lblEarnings')"
      />

      <home-masthead-nav-bar-item
        v-if="isFeatureEnabled('isBondsEnabled')"
        navigate-to-name="bonds"
        :text="$t('bonds.lblBonds')"
      />

      <home-masthead-nav-bar-item
        v-if="isFeatureEnabled('isDebitCardEnabled')"
        navigate-to-name="debit-card-manage"
        :text="$t('card.lblCard')"
      />

      <home-masthead-nav-bar-item
        navigate-to-name="home-more"
        :text="$t('lblMore')"
      />
    </home-masthead-nav-bar>
  </header>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import { formatToNative } from '@/utils/format';

import { ContextButton, ContextButtonItem } from '@/components/buttons';
import { ArrowDownIcon } from '@/components/controls';

import HomeMastheadAvatar from './home-masthead-avatar.vue';
import HomeMastheadNavBar from './home-masthead-nav-bar.vue';
import HomeMastheadNavBarItem from './home-masthead-nav-bar-item.vue';

export default Vue.extend({
  name: 'Masthead',
  components: {
    HomeMastheadAvatar,
    HomeMastheadNavBar,
    HomeMastheadNavBarItem,
    ArrowDownIcon,
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
          ...val.slice(0, cutSize + prefixSize),
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
