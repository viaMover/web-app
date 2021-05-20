<template>
  <div class="info info-bordered">
    <div class="item">
      <div class="title">
        {{ $t('treasuryPage.statement.lblBalance', { month: monthName }) }}
      </div>
      <div class="value">{{ balance }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('treasuryPage.statement.lblRewardsUsed') }}
      </div>
      <div class="value">{{ rewardsUsed }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('treasuryPage.statement.lblReservedAssets') }}
      </div>
      <div class="value">{{ reservedAssets }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('treasuryPage.statement.lblRemovedAssets') }}
      </div>
      <div class="value">{{ removedAssets }}</div>
    </div>
    <div class="item">
      <div class="title">
        {{ $t('treasuryPage.statement.lblAverageBoost') }}
      </div>
      <div class="value">{{ averageBoost }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'TreasuryMonthlyStatements',
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
