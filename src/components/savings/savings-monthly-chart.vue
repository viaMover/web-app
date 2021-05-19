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
  name: 'SavingsChart',
  data() {
    return {
      selectedDay: 1621408016,
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
    relativeChangeText(): string {
      const nextDay = dayjs.unix(this.selectedDay).add(1, 'day').unix();
      const selectedDayChange = this.earnedRelativeMonthlyChanges.find(
        (change) =>
          change.timeStamp >= this.selectedDay && change.timeStamp < nextDay
      );
      if (this.selectedDay == null || selectedDayChange === undefined) {
        return this.$t('savingsPage.lblEarnedRelativeMonthlyChange', {
          amount: this.earnedRelativeMonthlyChange
        }) as string;
      }

      return this.$t('savingsPage.lblEarnedRelativeMonthlyChangeExtended', {
        amount: selectedDayChange.value,
        date: this.selectedDayText
      }) as string;
    }
  }
});
</script>
