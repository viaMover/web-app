<template>
  <secondary-page hide-title>
    <!--    <treasury-monthly-chart-wrapper-->
    <!--      v-if="isFeatureEnabled('isTreasuryMonthlyChartEnabled')"-->
    <!--    />-->
    <treasury-monthly-statement />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { SecondaryPage } from '@/components/layout';
//import { TreasuryMonthlyChartWrapper } from '@/components/treasury';
import { TreasuryMonthlyStatement } from '@/components/treasury/treasury-monthly-statment';

export default Vue.extend({
  name: 'TreasuryMonthlyStatistics',
  components: {
    SecondaryPage,
    //TreasuryMonthlyChartWrapper,
    TreasuryMonthlyStatement
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
