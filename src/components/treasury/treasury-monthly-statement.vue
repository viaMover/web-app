<template>
  <analytics-list>
    <analytics-list-item
      :description="balance"
      :title="$t('treasury.statement.lblBalance', { month: monthName })"
    />
    <analytics-list-item
      :description="rewardsEarned"
      :title="$t('treasury.statement.lblRewardsEarned')"
    />
    <analytics-list-item
      :description="averageDailyEarnings"
      :title="$t('treasury.statement.lblAverageDailyEarnings')"
    />
    <analytics-list-item
      :description="rewardsUsed"
      :title="$t('treasury.statement.lblRewardsUsed')"
    />
    <analytics-list-item
      :description="averageDailySpendings"
      :title="$t('treasury.statement.lblAverageDailySpendings')"
    />
    <analytics-list-item
      :description="reservedAssets"
      :title="$t('treasury.statement.lblReservedAssets')"
    />
    <analytics-list-item
      :description="removedAssets"
      :title="$t('treasury.statement.lblRemovedAssets')"
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
  name: 'TreasuryMonthlyStatements',
  components: {
    AnalyticsListItem,
    AnalyticsList
  },
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  computed: {
    ...mapGetters('account', [
      'treasuryMonthBalanceNative',
      'treasuryMonthDepositedNative',
      'treasuryMonthWithdrewNative',
      'treasuryMonthBonusesUsedNative',
      'treasuryMonthAvgDailyEarningsNative',
      'treasuryMonthAvgDailySpendingsNative',
      'treasuryMonthEarnedThisMonthNative'
    ]),
    balance(): string {
      return `$${formatToNative(this.treasuryMonthBalanceNative)}`;
    },
    rewardsEarned(): string {
      const value = formatToNative(this.treasuryMonthEarnedThisMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    averageDailyEarnings(): string {
      const value = formatToNative(this.treasuryMonthAvgDailyEarningsNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    rewardsUsed(): string {
      const value = formatToNative(this.treasuryMonthBonusesUsedNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    averageDailySpendings(): string {
      const value = formatToNative(this.treasuryMonthAvgDailySpendingsNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    reservedAssets(): string {
      const value = formatToNative(this.treasuryMonthDepositedNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    removedAssets(): string {
      const value = formatToNative(this.treasuryMonthWithdrewNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    monthName(): string {
      return this.pageDate.format('MMMM');
    }
  }
});
</script>
