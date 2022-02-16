<template>
  <secondary-page class="manage empty" hide-info>
    <template v-slot:title>
      <secondary-page-header
        :description="$t('treasury.txtTreasuryEmptyDescription')"
        :title="treasuryBalance"
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
        {{ $t('treasury.lblIfYouReserveMoveInST') }}
      </div>
    </div>

    <product-info-wrapper is-short>
      <product-info-item
        :description="$t('treasury.lblMaximumBoost')"
        :title="currentMaxBoost"
      />
      <product-info-item
        :description="$t('treasury.lblGasCostCoverage')"
        :title="currentCostCoverage"
      />
    </product-info-wrapper>

    <action-button
      class="primary"
      :text="$t('treasury.lblStartBoosting')"
      @button-click="handleStartBoosting"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { TreasuryMonthBonusesItem } from '@/services/mover';
import { formatToNative } from '@/utils/format';

import { ActionButton } from '@/components/buttons';
import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { ProductInfoItem, ProductInfoWrapper } from '@/components/product-info';

export default Vue.extend({
  name: 'TreasuryEmpty',
  components: {
    ProductInfoItem,
    ProductInfoWrapper,
    SecondaryPageHeader,
    BarChart,
    SecondaryPage,
    ActionButton
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    treasuryBalance(): string {
      return `~ $${formatToNative(10184)}`;
    },
    currentMaxBoost(): string {
      return `3.5x`;
    },
    currentCostCoverage(): string {
      return this.$t('treasury.lblCurrentCostCoverage') as string;
    },
    chartDataSource(): Array<TreasuryMonthBonusesItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'treasury_month_bonuses_item',
        bonusesEarned: n,
        snapshotTimestamp: n,
        year: 2000 + n,
        month: 1 + n
      }));
    },
    chartAccentColor(): string {
      return this.colors['product-treasury'];
    }
  },
  methods: {
    async handleStartBoosting(): Promise<void> {
      await this.$router.push({
        name: 'treasury-increase'
      });
    }
  }
});
</script>
