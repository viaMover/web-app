<template>
  <div class="">
    <div class="savings__menu-wrapper-balance">
      <span class="balance">{{ savingsBalance }}</span>
      <p>{{ $t('savings.lblSavingsBalance') }}</p>
    </div>
    <div class="savings__menu-wrapper-graph">
      <p>
        {{
          $t('savings.lblEarnedRelativeMonthlyChangeExtendedMonthOnlyPrefix', {
            date: monthName
          })
        }}
        <b>{{ earnedLastMonth }}</b>
      </p>
      <bar-chart
        :chart-data-source="savingsInfo ? savingsInfo.last12MonthsBalances : []"
        :is-loading="isSavingsInfoLoading"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import dayjs from 'dayjs';

import { BarChart } from '@/components/charts';

export default Vue.extend({
  name: 'SavingsYearlyChartWrapper',
  components: { BarChart },
  data() {
    return {
      monthName: dayjs().format('MMMM')
    };
  },
  computed: {
    ...mapGetters('account', {
      savingsBalance: 'savingsInfoBalanceNative',
      earnedLastMonth: 'savingsInfoEarnedThisMonthNative'
    }),
    ...mapState('account', ['savingsInfo', 'isSavingsInfoLoading'])
  }
});
</script>
