<template>
  <left-rail-section :section-name="$t('savings.lblSavingsStats')">
    <left-rail-section-item
      :description="$t('savings.lblEarnedToday')"
      :value="earnedToday"
    />
    <left-rail-section-item
      :description="$t('savings.lblEarnedThisMonth')"
      :value="earnedThisMonth"
    />
    <left-rail-section-item
      :description="$t('savings.lblEarnedInTotal')"
      :value="earnedTotal"
    />
  </left-rail-section>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { formatToNative, getSignIfNeeded } from '@/utils/format';

import { LeftRailSection, LeftRailSectionItem } from '@/components/layout';

export default Vue.extend({
  name: 'SavingsStats',
  components: {
    LeftRailSection,
    LeftRailSectionItem
  },
  computed: {
    ...mapGetters('account', {
      savingsInfoEarnedThisMonthNative: 'savingsInfoEarnedThisMonthNative',
      savingsInfoEarnedTotalNative: 'savingsInfoEarnedTotalNative',
      savingsEstimatedEarningsTomorrowNative:
        'savingsEstimatedEarningsTomorrowNative'
    }),
    earnedToday(): string {
      const value = formatToNative(this.savingsEstimatedEarningsTomorrowNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedThisMonth(): string {
      const value = formatToNative(this.savingsInfoEarnedThisMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedTotal(): string {
      const value = formatToNative(this.savingsInfoEarnedTotalNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    }
  }
});
</script>
