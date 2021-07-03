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
import { mapGetters, mapState } from 'vuex';
import BigNumber from 'bignumber.js';

export default Vue.extend({
  name: 'SavingsOverview',
  computed: {
    ...mapState('account', {
      apy: 'savingsAPY',
      dpy: 'savingsDPY'
    }),
    ...mapGetters('account', {
      depositedAssets: 'savingsInfoBalanceNative',
      totalAssetsUnderManagement: 'savingsInfoTotalPoolBalanceNative'
    }),
    currentVariableAPY(): string {
      return new BigNumber(this.apy).toFixed(2);
    },
    monthAverageAPY(): string {
      return new BigNumber(this.dpy as string).multipliedBy(30, 10).toFixed(2);
    }
  }
});
</script>
