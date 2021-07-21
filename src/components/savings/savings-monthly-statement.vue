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
import dayjs from 'dayjs';
import { mapGetters, mapState } from 'vuex';
import { SavingsReceipt } from '@/services/mover';
import { fromWei, multiply } from '@/utils/bigmath';

import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';
import { BigNumber } from 'bignumber.js';

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
      'savingsMonthAverageEarnedNative'
    ]),
    monthName(): string {
      return this.pageDate.format('MMMM');
    },
    balanceNative(): string {
      const value = new BigNumber(this.savingsEndOfMonthBalanceNative).toFormat(
        2
      );
      return `$${value}`;
    },
    depositsNative(): string {
      const value = new BigNumber(
        this.savingsMonthTotalDepositsNative
      ).toFormat(2);
      return `+$${value}`;
    },
    withdrawalsNative(): string {
      const value = new BigNumber(
        this.savingsMonthTotalWithdrawalsNative
      ).toFormat(2);
      return `-$${value}`;
    },
    savedFeesNative(): string {
      // TODO: compute
      return '$0';
    },
    payoutsToTreasuryNative(): string {
      // TODO: compute
      return '$0';
    },
    totalEarned(): string {
      const value = new BigNumber(this.savingsMonthEarnedNative).toFormat(2);
      return `+$${value}`;
    },
    averageDailyEarnings(): string {
      const value = new BigNumber(
        this.savingsMonthAverageEarnedNative
      ).toFormat(2);
      return `+$${value}`;
    }
  }
});
</script>
