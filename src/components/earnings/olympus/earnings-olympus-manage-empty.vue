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
        {{ $t('earnings.txtIfYouStake', { token: 'OHM' }) }}
      </p>
      <div class="body margin-top-20">
        <product-info-wrapper>
          <product-info-item
            :description="$t('earnings.txtAPYOnAll', { token: 'OHM' })"
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

import { OlympusMonthBalanceItem } from '@/services/mover';
import { formatPercents, formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'EarningsOlympusManageEmpty',
  components: {
    ProductInfoItem,
    ProductInfoWrapper,
    SecondaryPageSimpleTitle,
    ActionButton,
    SecondaryPage,
    BarChart
  },
  computed: {
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
