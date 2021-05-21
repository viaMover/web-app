<template>
  <secondary-page :title="$t('savings.lblSavings')">
    <h2>{{ pageTitle }}</h2>
    <savings-monthly-chart />
    <savings-monthly-statement />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

import { SecondaryPage } from '@/components/layout';
import {
  SavingsMonthlyChart,
  SavingsMonthlyStatement
} from '@/components/savings';

export default Vue.extend({
  name: 'SavingsMonthlyStatistics',
  components: {
    SecondaryPage,
    SavingsMonthlyChart,
    SavingsMonthlyStatement
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
