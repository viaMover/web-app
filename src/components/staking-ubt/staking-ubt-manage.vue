<template>
  <secondary-page class="manage">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('stakingUBT.lblBalance')"
        :title="balance"
      />
    </template>

    <div class="banner">
      <h2 class="title">{{ $t('stakingUBT.lblComingSoon') }}</h2>
      <div class="description">{{ $t('stakingUBT.txtComingSoon') }}</div>
      <div class="media">
        <video
          autoplay="autoplay"
          data-keepplaying="data-keepplaying"
          loop="loop"
          muted="muted"
          src="@/assets/videos/TransactionWalletWaiting.webm"
        />
      </div>
      <div class="actions">
        <action-button
          class="primary"
          :text="$t('stakingUBT.lblDeposit')"
          @button-click="handleDepositClick"
        />

        <span class="delimiter">{{ $t('stakingUBT.lblOr') }}</span>

        <action-button
          class="primary"
          :text="$t('stakingUBT.lblWithdraw')"
          @button-click="handleWithdrawClick"
        />
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';

export default Vue.extend({
  name: 'StakingUbtManage',
  components: {
    ActionButton,
    SecondaryPageHeader,
    SecondaryPage
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapState('stakingUBT', {
      isInfoLoading: 'isInfoLoading'
    }),
    ...mapGetters('stakingUBT', {
      info: 'info',
      balanceNative: 'balanceNative'
    }),
    balance(): string {
      return `$${formatToNative(this.balanceNative)}`;
    },
    chartAccentColor(): string {
      return this.colors['product-staking-ubt'];
    }
  },
  methods: {
    handleDepositClick(): void {
      this.$router.push({ name: 'staking-ubt-deposit' });
    },
    handleWithdrawClick(): void {
      this.$router.push({ name: 'staking-ubt-withdraw' });
    }
  }
});
</script>
