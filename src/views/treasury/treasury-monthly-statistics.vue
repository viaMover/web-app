<template>
  <secondary-page :title="$t('treasury.lblSmartTreasury')">
    <h2>{{ pageTitle }}</h2>
    <treasury-monthly-chart />
    <treasury-monthly-statement />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import {
  TreasuryMonthlyChart,
  TreasuryMonthlyStatement
} from '@/components/treasury';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'TreasuryMonthlyStatistics',
  components: {
    SecondaryPage,
    TreasuryMonthlyChart,
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
  }
});
</script>
