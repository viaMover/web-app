<template>
  <secondary-page class="manage empty" hide-info>
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
        {{ $t('earnings.txtIfYouStake', { token: 'Ethereum' }) }}
      </div>
    </div>

    <product-info-wrapper>
      <product-info-item
        :description="$t('earnings.txtAPYOnAll', { token: 'Ethereum' })"
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

import { EthereumMonthBalanceItem } from '@/services/mover';
import { formatPercents, formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'EarningsEthereumManageEmpty',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    ProductInfoWrapper,
    ProductInfoItem,
    ActionButton,
    BarChart
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('earnings/ethereum', { apy: 'ethereumAPY' }),
    ...mapGetters('earnings/ethereum', { apyNative: 'apyNative' }),
    savingsBalance(): string {
      return `~ $${formatToNative(this.apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartDataSource(): Array<EthereumMonthBalanceItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'ethereum_month_balance_item',
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
        name: 'earnings-ethereum-stake'
      });
    }
  }
});
</script>
