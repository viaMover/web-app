<template>
  <div class="overview savings-overview">
    <h4>{{ $t('savingsPage.lblSavingsEstimation') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{
          $t('savingsPage.lblEstimatedEarningsTomorrow')
        }}</span>
        <span class="value">{{ estimatedEarningsTomorrow }}</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('savingsPage.lblEstimatedEarningsNextMonth')
        }}</span>
        <span class="value">{{ estimatedEarningsNextMonth }}%</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('savingsPage.lblEstimatedEarningsAnnually')
        }}</span>
        <span class="value">{{ estimatedEarningsAnnually }}%</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SavingsEstimation',
  data() {
    return {
      estimatedEarningsTomorrow: 0,
      estimatedEarningsNextMonth: 0,
      estimatedEarningsAnnually: 0
    };
  }
});
</script>
