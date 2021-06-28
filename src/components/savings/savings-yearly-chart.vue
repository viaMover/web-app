<template>
  <div class="">
    <span>{{ savingsBalance }}</span>
    <p>{{ $t('savings.lblSavingsBalance') }}</p>
    <savings-chart :chartData="chartData"></savings-chart>
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

import SavingsChart from '@/components/charts/savings-chart.vue';

export default Vue.extend({
  name: 'SavingsYearlyChart',
  components: { SavingsChart },
  computed: {
    ...mapGetters('account', {
      chartData: 'savingsInfoChartData',
      savingsBalance: 'savingsInfoBalanceNative',
      earnedLastMonth: 'savingsInfoEarnedThisMonthNative'
    }),
    ...mapState('account', ['savingsInfo', 'isSavingsInfoLoading'])
  }
});
</script>
