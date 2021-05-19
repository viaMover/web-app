<template>
  <secondary-page :title="$t('lblSavings')">
    <h2>{{ pageTitle }}</h2>
    <savings-monthly-chart />
    <savings-month-statement />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import SecondaryPage from '@/components/layout/secondary-page.vue';
import SavingsMonthlyChart from '@/components/savings/savings-monthly-chart.vue';
import SavingsMonthStatement from '@/components/savings/savings-monthly-statement.vue';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'SavingsMonthlyStatistics',
  components: {
    SecondaryPage,
    SavingsMonthlyChart,
    SavingsMonthStatement
  },
  computed: {
    pageTitle(): string {
      try {
        const tsFrom = Number(this.$route.query.tsFrom);

        return dayjs.unix(tsFrom).format('MMMM YYYY');
      } catch {
        return this.$t('swapsPage.statement.lblMonthStatisticFallback');
      }
    }
  }
});
</script>
