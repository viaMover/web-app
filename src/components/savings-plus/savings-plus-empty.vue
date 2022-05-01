<template>
  <secondary-page class="manage empty">
    <template v-slot:title>
      <secondary-page-header
        class="alternate"
        :description="$t('savingsPlus.empty.txtYouCouldApproximately')"
        :title="savingsBalance"
      />
    </template>

    <div class="chart-wrapper">
      <bar-chart
        :accent-color="chartAccentColor"
        :chart-data-source="chartDataSource"
        disable-selecting
        :is-loading="false"
      />
      <div class="bottom-text">
        {{ $t('savingsPlus.empty.txtLeveragedDeposit') }}
      </div>
    </div>

    <product-info-wrapper>
      <product-info-item
        :description="$t('savingsPlus.empty.lblAPYOnAllSavings')"
        :title="$t('savingsPlus.empty.lblUpTo', { value: currentVariableAPY })"
      />
      <product-info-item
        :description="$t('savingsPlus.empty.lblZapsFromChain')"
        :title="$t('savingsPlus.empty.lblMultichainZaps')"
      />
      <product-info-item
        :description="$t('savingsPlus.empty.lblZapsIntoUSDC')"
        :title="$t('savingsPlus.empty.lblTokenZaps')"
      />
    </product-info-wrapper>

    <action-button
      class="primary"
      :text="$t('savingsPlus.empty.lblStartSaving')"
      @button-click="handleDepositClick"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { SavingsMonthBalanceItem } from '@/services/mover';
import { divide, multiply } from '@/utils/bigmath';
import { formatPercents, formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'SavingsPlusEmpty',
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
    ...mapState('savingsPlus', { apy: 'APY' }),
    savingsBalance(): string {
      const apyNative = multiply(divide(this.apy, '100'), '10000');
      return `~ $${formatToNative(apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartDataSource(): Array<SavingsMonthBalanceItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'savings_month_balance_item',
        balance: 100,
        earned: n,
        snapshotTimestamp: n,
        year: 2000 + n,
        month: 1 + n
      }));
    },
    chartAccentColor(): string {
      return this.colors['product-savings'];
    }
  },
  methods: {
    async handleDepositClick(): Promise<void> {
      await this.$router.push({
        name: 'savings-plus-deposit'
      });
    }
  }
});
</script>
