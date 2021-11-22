<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <div>
      <secondary-page-simple-title
        class="page-title"
        :description="$t('savings.txtSavingsOverviewDescription')"
        :title="$t('savings.lblSavingsOverview')"
      />
      <statement-list>
        <statement-list-item
          :description="$t('savings.lblDepositedAssets')"
          :value="formattedDepositedAssets"
        />
        <statement-list-item
          :description="$t('savings.lblCurrentVariableAPY')"
          :value="currentVariableAPY"
        />
        <statement-list-item
          v-if="isFeatureEnabled('isSavingsOverviewSomeFieldsEnabled')"
          :description="$t('savings.lbl30DayAverageAPY')"
          :value="monthAverageAPY"
        />
        <statement-list-item
          v-if="isFeatureEnabled('isSavingsOverviewSomeFieldsEnabled')"
          :description="$t('savings.lblTotalAssetsUnderManagement')"
          :value="totalAssetsUnderManagement"
        />
      </statement-list>
      <statement-list :title="$t('savings.lblSavingsStats')">
        <statement-list-item
          :description="$t('savings.lblEarnedToday')"
          :value="earnedToday"
        />
        <statement-list-item
          :description="$t('savings.lblEarnedThisMonth')"
          :value="earnedThisMonth"
        />
        <statement-list-item
          :description="$t('savings.lblEarnedInTotal')"
          :value="earnedTotal"
        />
      </statement-list>
      <statement-list :title="$t('savings.lblSavingsEstimation')">
        <statement-list-item
          :description="$t('savings.lblEstimatedEarningsTomorrow')"
          :value="estimatedEarningsTomorrowNative"
          value-class="estimation"
        />
        <statement-list-item
          :description="$t('savings.lblEstimatedEarningsNextMonth')"
          :value="estimatedEarningsNextMonthNative"
          value-class="estimation"
        />
        <statement-list-item
          :description="$t('savings.lblEstimatedEarningsAnnually')"
          :value="estimatedEarningsAnnuallyNative"
          value-class="estimation"
        />
      </statement-list>
    </div>
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

import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';

export default Vue.extend({
  name: 'SavingsGlobalAnalytics',
  components: {
    SecondaryPage,
    SecondaryPageSimpleTitle,
    StatementListItem,
    StatementList
  },
  computed: {
    ...mapState('account', {
      apy: 'savingsAPY',
      dpy: 'savingsDPY'
    }),
    ...mapGetters('account', {
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
    isFeatureEnabled,
    handleBack(): void {
      this.$router.back();
    }
  }
});
</script>
