<template>
  <secondary-page class="manage empty">
    <template v-slot:title>
      <secondary-page-header
        class="balance"
        :description="$t('earnings.txtYouCouldApproximately')"
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
        {{ $t('earnings.txtIfYouStake', { token: 'OHM' }) }}
      </div>
    </div>

    <product-info-wrapper>
      <product-info-item
        :description="$t('earnings.txtAPYOnAll', { token: 'OHM' })"
        :title="currentVariableAPY"
      />
    </product-info-wrapper>

    <action-button
      class="primary"
      :text="$t('earnings.btnStart')"
      @button-click="handleStakeClick"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { OlympusMonthBalanceItem } from '@/services/mover';
import { formatPercents, formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'EarningsOlympusManageEmpty',
  components: {
    ProductInfoItem,
    ProductInfoWrapper,
    SecondaryPageHeader,
    ActionButton,
    SecondaryPage,
    BarChart
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('earnings/olympus', { apy: 'olympusAPY' }),
    ...mapGetters('earnings/olympus', { apyNative: 'apyNative' }),
    savingsBalance(): string {
      return `~ $${formatToNative(this.apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartDataSource(): Array<OlympusMonthBalanceItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'olympus_month_balance_item',
        balance: 100,
        earned: n,
        snapshotTimestamp: n,
        year: 2000 + n,
        month: 1 + n
      }));
    },
    chartAccentColor(): string {
      return this.colors['product-earnings'];
    }
  },
  methods: {
    async handleStakeClick(): Promise<void> {
      await this.$router.push({
        name: 'earnings-olympus-stake'
      });
    }
  }
});
</script>
