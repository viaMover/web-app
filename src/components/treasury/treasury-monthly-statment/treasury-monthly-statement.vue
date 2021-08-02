<template>
  <div>
    <div class="smart-treasury-statements__wrapper-title">
      <h2>{{ pageTitle }}</h2>
      <p>{{ formatItemRanges(1, 2) }}</p>
    </div>
    <ul class="smart-treasury-statements__wrapper-list">
      <treasury-monthly-statements-item
        :title="$t('treasury.statement.lblBalance', { month: monthName })"
        :value="balance"
      />
      <treasury-monthly-statements-item
        :title="$t('treasury.statement.lblRewardsUsed')"
        :value="rewardsUsed"
      />
      <treasury-monthly-statements-item
        :title="$t('treasury.statement.lblReservedAssets')"
        :value="reservedAssets"
      />
      <treasury-monthly-statements-item
        :title="$t('treasury.statement.lblRemovedAssets')"
        :value="removedAssets"
      />
      <treasury-monthly-statements-item
        :title="$t('treasury.statement.lblAverageBoost')"
        :value="averageBoost"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

import TreasuryMonthlyStatementsItem from './treasury-monthly-statement-item.vue';

export default Vue.extend({
  name: 'TreasuryMonthlyStatements',
  components: {
    TreasuryMonthlyStatementsItem
  },
  data() {
    return {
      balance: 0,
      rewardsUsed: 0,
      reservedAssets: 0,
      removedAssets: 0,
      averageBoost: 0
    };
  },
  computed: {
    pageTitle(): string {
      try {
        const year = Number(this.$route.params.year);
        const month = Number(this.$route.params.month);

        return dayjs(`${year} ${month}`).format('MMMM YYYY');
      } catch {
        return this.$t('swaps.statement.lblMonthStatisticFallback') as string;
      }
    },
    monthName(): string {
      try {
        const year = Number(this.$route.params.year);
        const month = Number(this.$route.params.month);

        return dayjs(`${year} ${month}`).format('MMMM');
      } catch {
        return '';
      }
    }
  },
  methods: {
    formatItemRanges(timestampFrom: number, timestampTo: number): string {
      const dateFrom = dayjs.unix(timestampFrom);
      const dateTo = dayjs.unix(timestampTo);

      if (dateFrom.year() !== dateTo.year()) {
        return `${dateFrom.format('MMM DD, YYYY')} – ${dateTo.format(
          'MMM DD, YYYY'
        )}`;
      }

      return `${dateFrom.format('MMM DD')} – ${dateTo.format('MMM DD, YYYY')}`;
    }
  }
});
</script>
