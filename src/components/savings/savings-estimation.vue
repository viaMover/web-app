<template>
  <left-rail-section :section-name="$t('savings.lblSavingsEstimation')">
    <left-rail-section-item
      :description="$t('savings.lblEstimatedEarningsTomorrow')"
      :value="estimatedEarningsTomorrowNative"
      value-class="estimation"
    />
    <left-rail-section-item
      :description="$t('savings.lblEstimatedEarningsNextMonth')"
      :value="estimatedEarningsNextMonthNative"
      value-class="estimation"
    />
    <left-rail-section-item
      :description="$t('savings.lblEstimatedEarningsAnnually')"
      :value="estimatedEarningsAnnuallyNative"
      value-class="estimation"
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
    ...mapGetters('account', [
      'savingsInfoBalanceNative',
      'savingsEstimatedEarningsTomorrowNative',
      'savingsEstimatedEarningsNextMonthNative',
      'savingsEstimatedEarningsAnnuallyNative'
    ]),
    estimatedEarningsTomorrowNative(): string {
      const value = new BigNumber(
        this.savingsEstimatedEarningsTomorrowNative
      ).toFormat(2);
      return `$${value}`;
    },
    estimatedEarningsNextMonthNative(): string {
      const value = new BigNumber(
        this.savingsEstimatedEarningsNextMonthNative
      ).toFormat(2);
      return `$${value}`;
    },
    estimatedEarningsAnnuallyNative(): string {
      const value = new BigNumber(
        this.savingsEstimatedEarningsAnnuallyNative
      ).toFormat(2);
      return `$${value}`;
    }
  }
});
</script>
e
