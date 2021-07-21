<template>
  <left-rail-section :section-name="$t('savings.lblSavingsOverview')">
    <left-rail-section-item
      :description="$t('savings.lblDepositedAssets')"
      :value="formattedDepositedAssets"
    />
    <left-rail-section-item
      :description="$t('savings.lblCurrentVariableAPY')"
      :value="currentVariableAPY"
    />
    <left-rail-section-item
      :description="$t('savings.lbl30DayAverageAPY')"
      :value="monthAverageAPY"
    />
    <left-rail-section-item
      :description="$t('savings.lblTotalAssetsUnderManagement')"
      :value="totalAssetsUnderManagement"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import BigNumber from 'bignumber.js';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';
import { getUSDCAssetData } from '@/wallet/references/data';

export default Vue.extend({
  name: 'SavingsOverview',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  computed: {
    ...mapState('account', {
      apy: 'savingsAPY',
      dpy: 'savingsDPY'
    }),
    ...mapGetters('account', {
      savingsInfoBalanceUSDC: 'savingsInfoBalanceUSDC',
      savingsInfoTotalPoolBalanceNative: 'savingsInfoTotalPoolBalanceNative'
    }),
    formattedDepositedAssets(): string {
      return `${new BigNumber(this.savingsInfoBalanceUSDC).toFormat(2)} USDC`;
    },
    currentVariableAPY(): string {
      const apy = new BigNumber(this.apy).toFixed(2);
      return `${apy}%`;
    },
    monthAverageAPY(): string {
      return this.currentVariableAPY; // TODO: get an average APY?
    },
    totalAssetsUnderManagement(): string {
      const value = new BigNumber(
        this.savingsInfoTotalPoolBalanceNative
      ).toFormat(2);
      return `$${value}`;
    }
  }
});
</script>
