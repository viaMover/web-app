<template>
  <analytics-list>
    <analytics-list-item
      :description="balanceNative"
      :title="$t('savings.statement.lblBalance', { month: monthName })"
    />
    <analytics-list-item
      :description="totalEarned"
      :title="
        $t('savings.statement.lblTotalEarnedInMonth', { month: monthName })
      "
    />
    <analytics-list-item
      :description="averageDailyEarnings"
      :title="
        $t('savings.statement.lblAverageDailyEarningsInMonth', {
          month: monthName
        })
      "
    />
    <analytics-list-item
      :description="depositsNative"
      :title="$t('savings.statement.lblDeposits', { month: monthName })"
    />
    <analytics-list-item
      :description="withdrawalsNative"
      :title="$t('savings.statement.lblWithdrawals', { month: monthName })"
    />
    <analytics-list-item
      :description="savedFeesNative"
      :title="$t('savings.statement.lblSavedFees')"
    />
    <analytics-list-item
      :description="payoutsToTreasuryNative"
      :title="$t('savings.statement.lblPayoutsToTreasury')"
    />
  </analytics-list>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { formatToNative, getSignIfNeeded } from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';

export default Vue.extend({
  name: 'SavingsMonthStatements',
  components: {
    AnalyticsList,
    AnalyticsListItem
  },
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  computed: {
    ...mapGetters('account', [
      'savingsEndOfMonthBalanceNative',
      'savingsMonthTotalDepositsNative',
      'savingsMonthTotalWithdrawalsNative',
      'savingsMonthEarnedNative',
      'savingsMonthAverageEarnedNative',
      'savingsMonthPaidToTreasuryNative',
      'savingsMonthSavedFeesNative'
    ]),
    monthName(): string {
      return this.pageDate.format('MMMM');
    },
    balanceNative(): string {
      return `$${formatToNative(this.savingsEndOfMonthBalanceNative)}`;
    },
    depositsNative(): string {
      const value = formatToNative(this.savingsMonthTotalDepositsNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    withdrawalsNative(): string {
      const value = formatToNative(this.savingsMonthTotalWithdrawalsNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    savedFeesNative(): string {
      return `$${formatToNative(this.savingsMonthSavedFeesNative)}`;
    },
    payoutsToTreasuryNative(): string {
      return `$${formatToNative(this.savingsMonthPaidToTreasuryNative)}`;
    },
    totalEarned(): string {
      const value = formatToNative(this.savingsMonthEarnedNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    averageDailyEarnings(): string {
      const value = formatToNative(this.savingsMonthAverageEarnedNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    }
  }
});
</script>
