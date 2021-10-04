<template>
  <statement-list wrapper-class="savings-statements__wrapper-list">
    <statement-list-item
      :description="$t('savings.statement.lblBalance', { month: monthName })"
      :value="balanceNative"
    />
    <statement-list-item
      :description="
        $t('savings.statement.lblTotalEarnedInMonth', { month: monthName })
      "
      :value="totalEarned"
    />
    <statement-list-item
      :description="
        $t('savings.statement.lblAverageDailyEarningsInMonth', {
          month: monthName
        })
      "
      :value="averageDailyEarnings"
    />
    <statement-list-item
      :description="$t('savings.statement.lblDeposits', { month: monthName })"
      :value="depositsNative"
    />
    <statement-list-item
      :description="
        $t('savings.statement.lblWithdrawals', { month: monthName })
      "
      :value="withdrawalsNative"
    />
    <statement-list-item
      :description="$t('savings.statement.lblSavedFees')"
      :value="savedFeesNative"
    />
    <statement-list-item
      :description="$t('savings.statement.lblPayoutsToTreasury')"
      :value="payoutsToTreasuryNative"
    />
  </statement-list>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { formatToNative, getSignIfNeeded } from '@/utils/format';

import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'SavingsMonthStatements',
  components: {
    StatementList,
    StatementListItem
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
