<template>
  <left-rail-section :section-name="$t('savings.lblSavingsEstimation')">
    <left-rail-section-item
      :description="$t('savings.lblEstimatedEarningsTomorrow')"
      :value="estimatedEarningsTomorrowNative"
    />
    <left-rail-section-item
      :description="$t('savings.lblEstimatedEarningsNextMonth')"
      :value="estimatedEarningsNextMonthNative"
    />
    <left-rail-section-item
      :description="$t('savings.lblEstimatedEarningsAnnually')"
      :value="estimatedEarningsAnnuallyNative"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import BigNumber from 'bignumber.js';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'SavingsEstimation',
  components: { LeftRailSection, LeftRailSectionItem },
  computed: {
    ...mapState('account', [
      'isSavingsInfoLoading',
      'savingsAPY',
      'savingsDPY'
    ]),
    ...mapGetters('account', ['savingsInfoBalanceNative']),
    estimatedEarningsTomorrowNative(): string {
      if (this.isSavingsInfoLoading) {
        return 'loading...';
      }

      if (this.savingsDPY === undefined) {
        return '0';
      }

      return new BigNumber(this.savingsInfoBalanceNative)
        .multipliedBy(new BigNumber(this.savingsDPY).dividedBy(100))
        .toFixed(2);
    },
    estimatedEarningsNextMonthNative(): string {
      if (this.isSavingsInfoLoading) {
        return 'loading...';
      }

      if (this.savingsDPY === undefined) {
        return '0';
      }

      return new BigNumber(this.savingsInfoBalanceNative)
        .multipliedBy(
          new BigNumber(this.savingsDPY).dividedBy(100).multipliedBy(30)
        )
        .toFixed(2);
    },
    estimatedEarningsAnnuallyNative(): string {
      if (this.isSavingsInfoLoading) {
        return 'loading...';
      }

      if (this.savingsDPY === undefined) {
        return '0';
      }

      return new BigNumber(this.savingsInfoBalanceNative)
        .multipliedBy(new BigNumber(this.savingsAPY).dividedBy(100))
        .toFixed(2);
    }
  }
});
</script>
