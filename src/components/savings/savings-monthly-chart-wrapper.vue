<template>
  <div class="chart-wrapper">
    <div class="stats-text">
      <line-chart
        :chart-data-source="savingsReceipt ? savingsReceipt.hourlyBalances : []"
        :is-loading="isSavingsReceiptLoading"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import dayjs from 'dayjs';

import { LineChart } from '@/components/charts';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'SavingsMonthlyChartWrapper',
  components: {
    LineChart
  },
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
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
    ...mapState('account', ['isSavingsReceiptLoading', 'savingsReceipt'])
  }
});
</script>
