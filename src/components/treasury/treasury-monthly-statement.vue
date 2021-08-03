<template>
  <statement-list wrapper-class="smart-treasury-statements__wrapper-list">
    <statement-list-item
      :description="$t('treasury.statement.lblBalance', { month: monthName })"
      :value="balance"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblRewardsEarned')"
      :value="rewardsEarned"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblAverageDailyEarnings')"
      :value="averageDailyEarnings"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblRewardsUsed')"
      :value="rewardsUsed"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblAverageDailySpendings')"
      :value="averageDailySpendings"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblReservedAssets')"
      :value="reservedAssets"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblRemovedAssets')"
      :value="removedAssets"
    />
    <statement-list-item
      :description="$t('treasury.statement.lblAverageBoost')"
      :value="averageBoost"
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
  name: 'TreasuryMonthlyStatements',
  components: {
    StatementListItem,
    StatementList
  },
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  data() {
    return {
      treasuryMonthRewardsEarned: 0,
      treasuryMonthAverageDailyEarnings: 0,
      treasuryMonthRewardsUsed: 0,
      treasuryMonthAverageDailySpendings: 0,
      treasuryMonthAverageBoost: 0
    };
  },
  computed: {
    ...mapGetters('account', [
      'treasuryMonthBalanceNative',
      'treasuryMonthDepositedNative',
      'treasuryMonthWithdrewNative'
    ]),
    balance(): string {
      return `$${formatToNative(this.treasuryMonthBalanceNative)}`;
    },
    rewardsEarned(): string {
      const value = formatToNative(this.treasuryMonthRewardsEarned);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    averageDailyEarnings(): string {
      const value = formatToNative(this.treasuryMonthAverageDailyEarnings);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    rewardsUsed(): string {
      const value = formatToNative(this.treasuryMonthRewardsUsed);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    averageDailySpendings(): string {
      const value = formatToNative(this.treasuryMonthAverageDailySpendings);
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
    averageBoost(): string {
      return `${this.treasuryMonthAverageBoost}x`;
    },
    monthName(): string {
      return this.pageDate.format('MMMM');
    }
  }
});
</script>
