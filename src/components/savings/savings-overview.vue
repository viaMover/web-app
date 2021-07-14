<template>
  <left-rail-section :section-name="$t('savings.lblSavingsOverview')">
    <left-rail-section-item
      :description="$t('savings.lblDepositedAssets')"
      :value="depositedAssets"
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
