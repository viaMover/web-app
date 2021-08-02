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
import { mapGetters } from 'vuex';

import { formatToNative } from '@/utils/format';

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
      return `$${formatToNative(this.savingsEstimatedEarningsTomorrowNative)}`;
    },
    estimatedEarningsNextMonthNative(): string {
      return `$${formatToNative(this.savingsEstimatedEarningsNextMonthNative)}`;
    },
    estimatedEarningsAnnuallyNative(): string {
      return `$${formatToNative(this.savingsEstimatedEarningsAnnuallyNative)}`;
    }
  }
});
</script>
e
