<template>
  <secondary-page class="analytics">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('savings.txtSavingsOverviewDescription')"
        :title="$t('savings.lblSavingsOverview')"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="formattedDepositedAssets"
        :is-loading="isLoading"
        :title="$t('savings.lblDepositedAssets')"
      />
      <analytics-list-item
        :description="currentVariableAPY"
        :is-loading="isLoading"
        :title="$t('savings.lblCurrentVariableAPY')"
      />
      <analytics-list-item
        v-if="isSavingsOverviewSomeFieldsEnabled"
        :description="monthAverageAPY"
        :is-loading="isLoading"
        :title="$t('savings.lbl30DayAverageAPY')"
      />
      <analytics-list-item
        v-if="isSavingsOverviewSomeFieldsEnabled"
        :description="totalAssetsUnderManagement"
        :is-loading="isLoading"
        :title="$t('savings.lblTotalAssetsUnderManagement')"
      />
    </analytics-list>

    <analytics-list :title="$t('savings.lblSavingsStats')">
      <analytics-list-item
        :description="earnedToday"
        :is-loading="isLoading"
        :title="$t('savings.lblEarnedToday')"
      />
      <analytics-list-item
        :description="earnedThisMonth"
        :is-loading="isLoading"
        :title="$t('savings.lblEarnedThisMonth')"
      />
      <analytics-list-item
        :description="earnedTotal"
        :is-loading="isLoading"
        :title="$t('savings.lblEarnedInTotal')"
      />
    </analytics-list>
    <analytics-list :title="$t('savings.lblSavingsEstimation')">
      <analytics-list-item
        :description="estimatedEarningsTomorrowNative"
        :is-loading="isLoading"
        :title="$t('savings.lblEstimatedEarningsTomorrow')"
      />
      <analytics-list-item
        :description="estimatedEarningsNextMonthNative"
        :is-loading="isLoading"
        :title="$t('savings.lblEstimatedEarningsNextMonth')"
      />
      <analytics-list-item
        :description="estimatedEarningsAnnuallyNative"
        :is-loading="isLoading"
        :title="$t('savings.lblEstimatedEarningsAnnually')"
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
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsList,
    AnalyticsListItem
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    ...mapState('savings', {
      isLoading: 'isSavingsInfoLoading',
      apy: 'savingsAPY',
      dpy: 'savingsDPY'
    }),
    ...mapGetters('savings', {
      savingsInfoEarnedThisMonthNative: 'savingsInfoEarnedThisMonthNative',
      savingsInfoEarnedTotalNative: 'savingsInfoEarnedTotalNative',
      savingsEstimatedEarningsTomorrowNative:
        'savingsEstimatedEarningsTomorrowNative',
      savingsInfoBalanceUSDC: 'savingsInfoBalanceUSDC',
      savingsInfoTotalPoolBalanceNative: 'savingsInfoTotalPoolBalanceNative',
      savingsAvg30DaysAPY: 'savingsAvg30DaysAPY',
      savingsInfoBalanceNative: 'savingsInfoBalanceNative',
      savingsEstimatedEarningsNextMonthNative:
        'savingsEstimatedEarningsNextMonthNative',
      savingsEstimatedEarningsAnnuallyNative:
        'savingsEstimatedEarningsAnnuallyNative'
    }),
    isSavingsOverviewSomeFieldsEnabled(): boolean {
      return isFeatureEnabled(
        'isSavingsOverviewSomeFieldsEnabled',
        this.networkInfo?.network
      );
    },
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
    },
    estimatedEarningsTomorrowNative(): string {
      const value = formatToNative(this.savingsEstimatedEarningsTomorrowNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    estimatedEarningsNextMonthNative(): string {
      const value = formatToNative(
        this.savingsEstimatedEarningsNextMonthNative
      );
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    estimatedEarningsAnnuallyNative(): string {
      const value = formatToNative(this.savingsEstimatedEarningsAnnuallyNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
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
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
