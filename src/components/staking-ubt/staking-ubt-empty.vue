<template>
  <secondary-page class="manage empty">
    <template v-slot:title>
      <secondary-page-header
        class="alternate"
        :description="$t('stakingUBT.txtApproximateEarnEstimation')"
        :title="balance"
      />
    </template>

    <div class="chart-wrapper">
      <bar-chart
        :accent-color="chartAccentColor"
        :chart-data-source="chartDataSource"
        disable-selecting
        :is-loading="false"
      />
      <div class="bottom-text">{{ $t('stakingUBT.txtIfYouDeposit') }}</div>
    </div>

    <product-info-wrapper>
      <product-info-item
        :description="$t('stakingUBT.txtAPY')"
        :title="currentVariableAPY"
      />
    </product-info-wrapper>

    <action-button
      class="primary"
      :text="$t('stakingUBT.btnStartStaking')"
      @button-click="handleDepositClick"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { StakingUbtMonthBalanceItem } from '@/services/v2/api/mover/staking-ubt';
import { divide, multiply } from '@/utils/bigmath';
import { formatPercents, formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'StakingUbtEmpty',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ProductInfoItem,
    ProductInfoWrapper,
    ActionButton,
    BarChart
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    apy(): string {
      return '0.0';
    },
    balance(): string {
      const annualYield = multiply(divide(this.apy, '100'), '10000');
      return `~ $${formatToNative(annualYield)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartDataSource(): Array<StakingUbtMonthBalanceItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'staking_ubt_month_balance_item',
        balance: 100,
        earned: n,
        snapshotTimestamp: n,
        year: 2000 + n,
        month: 1 + n
      }));
    },
    chartAccentColor(): string {
      return this.colors['product-staking-ubt'];
    }
  },
  methods: {
    async handleDepositClick(): Promise<void> {
      await this.$router.push({
        name: 'staking-ubt-deposit'
      });
    }
  }
});
</script>
