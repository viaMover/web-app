<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('savingsPlus.overview.lblSPOverviewDescription')"
        :title="$t('savingsPlus.overview.lblSPOverview')"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="formattedDepositedAssets"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblDepositedAssets')"
      />
      <analytics-list-item
        :description="currentVariableAPY"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblCurrentVariableAPY')"
      />
    </analytics-list>

    <analytics-list :title="$t('savingsPlus.overview.lblSPStats')">
      <analytics-list-item
        :description="earnedToday"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblEarnedToday')"
      />
      <analytics-list-item
        :description="earnedThisMonth"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblEarnedThisMonth')"
      />
      <analytics-list-item
        :description="earnedTotal"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblEarnedInTotal')"
      />
    </analytics-list>
    <analytics-list :title="$t('savingsPlus.overview.lblSPEstimation')">
      <analytics-list-item
        :description="formattedEstimatedEarningsTomorrowNative"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblEstimatedEarningsTomorrow')"
      />
      <analytics-list-item
        :description="formattedEstimatedEarningsNextMonthNative"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblEstimatedEarningsNextMonth')"
      />
      <analytics-list-item
        :description="formattedEstimatedEarningsAnnuallyNative"
        :is-loading="isLoading"
        :title="$t('savingsPlus.overview.lblEstimatedEarningsAnnually')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';
import {
  formatPercents,
  formatToNative,
  getSignIfNeeded
} from '@/utils/format';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';

export default Vue.extend({
  name: 'SavingsPlusGlobalAnalytics',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsList,
    AnalyticsListItem
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    ...mapState('savingsPlus', {
      isLoading: 'isInfoLoading',
      apy: 'APY',
      dpy: 'DPY'
    }),
    ...mapGetters('savingsPlus', {
      infoEarnedThisMonthNative: 'infoEarnedThisMonthNative',
      infoEarnedTotalNative: 'infoEarnedTotalNative',
      estimatedEarningsTomorrowNative: 'estimatedEarningsTomorrowNative',
      infoBalanceUSDC: 'infoBalanceUSDC',
      infoTotalPoolBalanceNative: 'infoTotalPoolBalanceNative',
      infoBalanceNative: 'infoBalanceNative',
      estimatedEarningsNextMonthNative: 'estimatedEarningsNextMonthNative',
      estimatedEarningsAnnuallyNative: 'estimatedEarningsAnnuallyNative'
    }),
    formattedDepositedAssets(): string {
      return `${formatToNative(this.infoBalanceUSDC)} USDC`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    totalAssetsUnderManagement(): string {
      return `$${formatToNative(this.infoTotalPoolBalanceNative)}`;
    },
    formattedEstimatedEarningsTomorrowNative(): string {
      const value = formatToNative(this.estimatedEarningsTomorrowNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    formattedEstimatedEarningsNextMonthNative(): string {
      const value = formatToNative(this.estimatedEarningsNextMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    formattedEstimatedEarningsAnnuallyNative(): string {
      const value = formatToNative(this.estimatedEarningsAnnuallyNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedToday(): string {
      const value = formatToNative(this.estimatedEarningsTomorrowNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedThisMonth(): string {
      const value = formatToNative(this.infoEarnedThisMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedTotal(): string {
      const value = formatToNative(this.infoEarnedTotalNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    }
  },
  methods: {
    isFeatureEnabled,
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
