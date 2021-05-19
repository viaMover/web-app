<template>
  <div class="info info-bordered">
    <div class="item">
      <div class="title">
        {{ $t('savingsPage.statement.lblBalance', { month: monthName }) }}
      </div>
      <div class="value">{{ balance }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savingsPage.statement.lblDeposits', { month: monthName }) }}
      </div>
      <div class="value">{{ deposits }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savingsPage.statement.lblWithdrawals', { month: monthName }) }}
      </div>
      <div class="value">{{ withdrawals }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savingsPage.statement.lblSavedFees') }}
      </div>
      <div class="value">{{ savedFees }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('savingsPage.statement.lblPayoutsToTreasury') }}
      </div>
      <div class="value">{{ payoutsToTreasury }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'SavingsMonthStatements',
  data() {
    return {
      balance: 0,
      deposits: 0,
      withdrawals: 0,
      savedFees: 0,
      payoutsToTreasury: 0
    };
  },
  computed: {
    monthName(): string {
      try {
        const tsFrom = Number(this.$route.query.tsFrom);

        return dayjs.unix(tsFrom).format('MMMM');
      } catch {
        return '';
      }
    }
  },
  methods: {
    formatItemHeader(timestamp: number): string {
      return dayjs.unix(timestamp).format('MMMM YYYY');
    },
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
