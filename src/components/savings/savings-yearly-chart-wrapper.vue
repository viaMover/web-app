<template>
  <div class="">
    <div class="savings__menu-wrapper-balance">
      <span class="balance">{{ savingsBalance }}</span>
      <p>{{ $t('savings.lblSavingsBalance') }}</p>
    </div>
    <div class="savings__menu-wrapper-graph">
      <bar-chart
        :chart-data-source="savingsInfo ? savingsInfo.last12MonthsBalances : []"
        :is-loading="isSavingsInfoLoading"
      />
      <p>
        {{
          $t('savings.lblEarnedRelativeMonthlyChangeExtendedMonthOnlyPrefix', {
            date: monthName
          })
        }}
        <b>{{ earnedLastMonth }}</b>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import dayjs from 'dayjs';

import { BarChart } from '@/components/charts';
import { BigNumber } from 'bignumber.js';

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
      savingsInfoBalanceNative: 'savingsInfoBalanceNative',
      savingsInfoEarnedThisMonthNative: 'savingsInfoEarnedThisMonthNative'
    }),
    ...mapState('account', ['savingsInfo', 'isSavingsInfoLoading']),
    savingsBalance(): string {
      const value = new BigNumber(this.savingsInfoBalanceNative).toFormat(2);
      return `$${value}`;
    },
    earnedLastMonth(): string {
      const value = new BigNumber(
        this.savingsInfoEarnedThisMonthNative
      ).toFormat(2);
      return `$${value}`;
    }
  }
});
</script>
