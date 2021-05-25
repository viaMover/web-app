<template>
  <div class="chart-wrapper">
    <div class="stats-text">
      <span>{{ earnedThisMonth }}</span>
      <span>{{
        $t('treasury.lblEarnedRelativeMonthlyChange', {
          amount: earnedRelativeMonthlyChange
        })
      }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TreasuryYearlyChart',
  data() {
    return {
      earnedThisMonth: 2984.49,
      earnedRelativeMonthlyChange: 30.37
    };
  }
});
</script>
