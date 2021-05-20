<template>
  <div class="overview savings-overview">
    <h4>{{ $t('savingsPage.lblSavingsOverview') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('savingsPage.lblDepositedAssets') }}</span>
        <span class="value">{{ depositedAssets }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savingsPage.lblCurrentVariableAPY') }}</span>
        <span class="value">{{ currentVariableAPY }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savingsPage.lbl30DayAverageAPY') }}</span>
        <span class="value">{{ monthAverageAPY }}%</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('savingsPage.lblTotalAssetsUnderManagement')
        }}</span>
        <span class="value">{{ totalAssetsUnderManagement }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SavingsOverview',
  data() {
    return {
      depositedAssets: 0,
      currentVariableAPY: 0,
      monthAverageAPY: 0,
      totalAssetsUnderManagement: 0
    };
  }
});
</script>
