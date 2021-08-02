<template>
  <secondary-page :title="$t('treasury.lblSmartTreasury')">
    <h2>{{ pageTitle }}</h2>
    <treasury-monthly-chart-wrapper
      v-if="isFeatureEnabled('isTreasuryMonthlyChartEnabled')"
    />
    <treasury-monthly-statement />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

import { isFeatureEnabled } from '@/settings';

import { SecondaryPage } from '@/components/layout';
import {
  TreasuryMonthlyChartWrapper,
  TreasuryMonthlyStatement
} from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryMonthlyStatistics',
  components: {
    SecondaryPage,
    TreasuryMonthlyChartWrapper,
    TreasuryMonthlyStatement
  },
  computed: {
    pageTitle(): string {
      try {
        const tsFrom = Number(this.$route.query.tsFrom);

        return dayjs.unix(tsFrom).format('MMMM YYYY');
      } catch {
        return this.$t('swaps.statement.lblMonthStatisticFallback') as string;
      }
    }
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
