<template>
  <div class="chart-wrapper">
    <div class="stats-text">
      <span>{{ earnedThisMonth }}</span>
      <span>{{ relativeChangeText }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import dayjs from 'dayjs';

export default Vue.extend({
  name: 'TreasuryMonthlyChart',
  data() {
    return {
      selectedDay: null as number | null,
      earnedThisMonth: 2984.49,
      earnedRelativeMonthlyChange: 30.37,
      earnedRelativeMonthlyChanges: [
        {
          timeStamp: 1621408016,
          value: 0.35
        }
      ]
    };
  },
  computed: {
    selectedDayText(): string {
      if (this.selectedDay === null) {
        return '';
      }

      return dayjs.unix(this.selectedDay).format('MMMM DD, YYYY');
    },
    monthName(): string {
      try {
        const tsFrom = Number(this.$route.query.tsFrom);

        return dayjs.unix(tsFrom).format('MMMM');
      } catch {
        return '';
      }
    },
    relativeChangeText(): string {
      if (this.selectedDay === null) {
        return this.$t(
          'treasury.lblEarnedRelativeMonthlyChangeExtendedMonthOnly',
          {
            amount: this.earnedRelativeMonthlyChange,
            month: this.monthName
          }
        ) as string;
      }

      // introduced because of weird TS issue "Object is possibly 'null'"
      // immediately after null check :/
      const currentDay = this.selectedDay;
      const nextDay = dayjs.unix(this.selectedDay).add(1, 'day').unix();
      const selectedDayChange = this.earnedRelativeMonthlyChanges.find(
        (change) => change.timeStamp >= currentDay && change.timeStamp < nextDay
      );

      if (selectedDayChange === undefined) {
        return this.$t(
          'treasury.lblEarnedRelativeMonthlyChangeExtendedMonthOnly',
          {
            amount: this.earnedRelativeMonthlyChange,
            month: this.monthName
          }
        ) as string;
      }

      return this.$t('treasury.lblEarnedRelativeMonthlyChangeExtended', {
        amount: selectedDayChange.value,
        date: this.selectedDayText
      }) as string;
    }
  }
});
</script>
