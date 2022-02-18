<template>
  <secondary-page class="analytics" has-back-button @back="handleBack">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('earnings.txtOverview')"
        :title="$t('earnings.lblOverview', { token: 'Ethereum' })"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="depositAsset"
        :title="$t('earnings.lblDepositedAssets')"
      />
      <analytics-list-item
        :description="currentVariableAPY"
        :title="$t('earnings.lblCurrentVariableAPY')"
      />
      <analytics-list-item
        :description="monthAverageAPY"
        :title="$t('earnings.lbl30DayAverageAPY')"
      />
      <analytics-list-item
        :description="totalAssetsUnderManagement"
        :title="$t('earnings.lblTotalAssetsUnderManagement')"
      />
    </analytics-list>
    <analytics-list :title="$t('earnings.lblEarningsStats')">
      <analytics-list-item
        :description="earnedToday"
        :title="$t('earnings.lblEarnedToday')"
      />
      <analytics-list-item
        :description="earnedThisMonth"
        :title="$t('earnings.lblEarnedThisMonth')"
      />
      <analytics-list-item
        :description="earnedInTotal"
        :title="$t('earnings.lblEarnedInTotal')"
      />
    </analytics-list>
    <analytics-list :title="$t('earnings.lblEarningsEstimation')">
      <analytics-list-item
        :description="estimatedEarningsTomorrow"
        :title="$t('earnings.lblEstimatedEarningsTomorrow')"
      />
      <analytics-list-item
        :description="estimatedEarningsThisMonth"
        :title="$t('earnings.lblEstimatedEarningsThisMonth')"
      />
      <analytics-list-item
        :description="estimatedEarningsAnnually"
        :title="$t('earnings.lblEstimatedEarningsAnnually')"
      />
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';

export default Vue.extend({
  name: 'EarningsEthereumGlobalAnalytics',
  components: {
    AnalyticsList,
    AnalyticsListItem,
    SecondaryPageHeader,
    SecondaryPage
  },
  computed: {
    depositAsset(): number {
      return 0;
    },
    currentVariableAPY(): number {
      return 0;
    },
    monthAverageAPY(): number {
      return 0;
    },
    totalAssetsUnderManagement(): number {
      return 0;
    },
    earnedToday(): number {
      return 0;
    },
    earnedThisMonth(): number {
      return 0;
    },
    earnedInTotal(): number {
      return 0;
    },
    estimatedEarningsTomorrow(): number {
      return 0;
    },
    estimatedEarningsThisMonth(): number {
      return 0;
    },
    estimatedEarningsAnnually(): number {
      return 0;
    }
  },
  methods: {
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
