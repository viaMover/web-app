<template>
  <div class="overview savings-overview">
    <h4>{{ $t('savings.lblSavingsOverview') }}</h4>
    <div class="info info-bordered">
      <div class="item">
        <span class="title">{{ $t('savings.lblDepositedAssets') }}</span>
        <span class="value">{{ depositedAssets }}</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savings.lblCurrentVariableAPY') }}</span>
        <span class="value">{{ currentVariableAPY }}%</span>
      </div>
      <div class="item">
        <span class="title">{{ $t('savings.lbl30DayAverageAPY') }}</span>
        <span class="value">{{ monthAverageAPY }}%</span>
      </div>
      <div class="item">
        <span class="title">{{
          $t('savings.lblTotalAssetsUnderManagement')
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
