<template>
  <div class="">
    <div class="smart-treasury__menu-wrapper-balance">
      <span class="balance">{{ bonusBalance }}</span>
      <p>{{ $t('treasury.lblTreasuryBonusBalance') }}</p>
    </div>
    <div class="smart-treasury__menu-wrapper-graph">
      <p>
        {{
          $t('savings.lblEarnedRelativeMonthlyChange', {
            date: monthName
          })
        }}
        <b>{{ earnedThisMonth }}</b>
      </p>
      <bar-chart :chart-data-source="[]" :is-loading="true" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { BarChart } from '@/components/charts';
import dayjs from 'dayjs';

export default Vue.extend({
  name: 'TreasuryYearlyChart',
  components: {
    BarChart
  },
  data() {
    return {
      bonusBalance: '0',
      earnedThisMonth: 2984.49,
      earnedRelativeMonthlyChange: 30.37,
      monthName: dayjs().format('MMMM')
    };
  }
});
</script>
