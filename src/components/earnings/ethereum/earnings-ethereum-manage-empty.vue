<template>
  <secondary-page hide-title>
    <div class="empty-state-graph-wrapper">
      <secondary-page-simple-title
        class="balance"
        :description="$t('earnings.txtYouCouldApproximately')"
        :title="savingsBalance"
      />
      <bar-chart
        :chart-data-source="chartDataSource"
        disable-selecting
        :is-loading="false"
      />
      <p class="margin-top">
        {{ $t('earnings.txtIfYouStake', { token: 'Ethereum' }) }}
      </p>
      <div class="body margin-top-20">
        <product-info-wrapper>
          <product-info-item
            :description="$t('earnings.txtAPYOnAll', { token: 'Ethereum' })"
            is-black-description
            :title="currentVariableAPY"
          />
        </product-info-wrapper>
        <action-button
          button-class="button button-active bold"
          :text="$t('earnings.btnStart')"
          @button-click="handleStakeClick"
        />
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { SavingsMonthBalanceItem } from '@/services/mover';
import { formatPercents, formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'EarningsEthereumManageEmpty',
  components: {
    ProductInfoItem,
    ProductInfoWrapper,
    SecondaryPageSimpleTitle,
    ActionButton,
    SecondaryPage,
    BarChart
  },
  computed: {
    ...mapState('earnings/ethereum', { apy: 'ethereumAPY' }),
    ...mapGetters('earnings/ethereum', { apyNative: 'apyNative' }),
    savingsBalance(): string {
      return `~ $${formatToNative(this.apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartDataSource(): Array<SavingsMonthBalanceItem> {
      //TODO
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
    async handleStakeClick(): Promise<void> {
      await this.$router.push({
        name: 'savings-deposit'
      });
    }
  }
});
</script>
