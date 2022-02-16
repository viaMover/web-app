<template>
  <div class="chart-wrapper">
    <div class="stats-text">
      <line-chart
        :chart-data-source="receipt ? receipt.hourlyBalances : []"
        :is-loading="isLoading"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters } from 'vuex';

import dayjs from 'dayjs';

import { SavingsReceipt } from '@/services/mover';
import { SavingsGetReceiptPayload } from '@/store/modules/savings/types';

import { LineChart } from '@/components/charts';

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
      isLoading: true,
      isError: false,
      receipt: undefined as SavingsReceipt | undefined
    };
  },
  computed: {
    ...mapGetters('savings', {
      savingsReceipt: 'savingsReceipt'
    })
  },
  async mounted() {
    this.isLoading = true;

    const year = this.pageDate.get('year');
    const month = this.pageDate.get('month') + 1;

    this.fetchSavingsReceipt({
      year,
      month
    } as SavingsGetReceiptPayload);

    let receipt: SavingsReceipt | undefined;

    try {
      receipt = await this.savingsReceipt(year, month);
      if (receipt === undefined) {
        throw new Error('receipt is undef');
      }
    } catch (e) {
      this.isLoading = false;
      this.isError = true;
      return;
    }

    this.receipt = receipt;
    this.isLoading = false;
  },
  methods: {
    ...mapActions('savings', { fetchSavingsReceipt: 'fetchSavingsReceipt' })
  }
});
</script>
