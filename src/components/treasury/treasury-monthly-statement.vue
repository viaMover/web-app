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
import Vue from 'vue';
import dayjs from 'dayjs';

import StatementList from '@/components/statements/statement-list/statement-list.vue';
import StatementListItem from '@/components/statements/statement-list/statement-list-item.vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'TreasuryMonthlyStatements',
  components: {
    StatementListItem,
    StatementList
  },
  data() {
    return {
      rewardsEarned: 0,
      averageDailyEarnings: 0,
      rewardsUsed: 0,
      averageDailySpendings: 0,
      averageBoost: 0
    };
  },
  computed: {
    ...mapGetters('account', {
      balance: 'treasuryMonthBalanceNative',
      reservedAssets: 'treasuryMonthDepositedNative',
      removedAssets: 'treasuryMonthWithdrewNative'
    }),
    monthName(): string {
      try {
        const year = Number(this.$route.params.year);
        const month = Number(this.$route.params.month);

        return dayjs(`${year} ${month}`).format('MMMM');
      } catch {
        return '';
      }
    }
  }
});
</script>
