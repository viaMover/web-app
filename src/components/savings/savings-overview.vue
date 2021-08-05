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

import { formatPercents, formatToNative } from '@/utils/format';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

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
      savingsInfoTotalPoolBalanceNative: 'savingsInfoTotalPoolBalanceNative',
      savingsAvg30DaysAPY: 'savingsAvg30DaysAPY'
    }),
    formattedDepositedAssets(): string {
      return `${formatToNative(this.savingsInfoBalanceUSDC)} USDC`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    monthAverageAPY(): string {
      return `${formatPercents(this.savingsAvg30DaysAPY)}%`;
    },
    totalAssetsUnderManagement(): string {
      return `$${formatToNative(this.savingsInfoTotalPoolBalanceNative)}`;
    }
  }
});
</script>
