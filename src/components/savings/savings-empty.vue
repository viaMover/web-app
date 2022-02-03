<template>
  <secondary-page class="manage empty" hide-info>
    <template v-slot:title>
      <secondary-page-header
        :description="$t('savings.txtYouCouldApproximately')"
        :title="savingsBalance"
      />
    </template>

    <div class="chart-wrapper">
      <bar-chart
        :chart-data-source="chartDataSource"
        disable-selecting
        :is-loading="false"
      />
      <p class="margin-top">{{ $t('savings.txtIfYouDeposit') }}</p>
    </div>

    <product-info-wrapper>
      <product-info-item
        :description="$t('savings.lblAPYOnAllSavings')"
        :title="currentVariableAPY"
      />
    </product-info-wrapper>

    <action-button
      class="primary"
      :text="$t('savings.lblStartSaving')"
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
  name: 'SavingsEmpty',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ProductInfoItem,
    ProductInfoWrapper,
    ActionButton,
    BarChart
  },
  computed: {
    ...mapState('savings', { apy: 'savingsAPY' }),
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
    }
  },
  methods: {
    async handleDepositClick(): Promise<void> {
      await this.$router.push({
        name: 'savings-deposit'
      });
    }
  }
});
</script>
