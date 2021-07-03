<template>
  <div class="">
    <span>{{ savingsBalance }}</span>
    <p>{{ $t('savings.lblSavingsBalance') }}</p>
    <bar-chart
      :chart-data-source="savingsInfo ? savingsInfo.last12MonthsBalances : []"
      :is-loading="isSavingsInfoLoading"
    ></bar-chart>
    <span>{{
      $t('savings.lblEarnedRelativeMonthlyChange', {
        amount: earnedLastMonth
      })
    }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { BarChart } from '@/components/charts';

export default Vue.extend({
  name: 'SavingsYearlyChartWrapper',
  components: { BarChart },
  computed: {
    ...mapGetters('account', {
      savingsBalance: 'savingsInfoBalanceNative',
      earnedLastMonth: 'savingsInfoEarnedThisMonthNative'
    }),
    ...mapState('account', ['savingsInfo', 'isSavingsInfoLoading'])
  }
});
</script>
