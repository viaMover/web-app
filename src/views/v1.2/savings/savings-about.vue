<template>
  <module-about
    :description="formattedNativeBalance"
    :title="$t('savingsBalance')"
  >
    <template #links>
      <base-item-icon
        icon-class="icon-about-savings"
        navigate-to="savings-about"
        :text="$t('aboutSavings')"
      />

      <base-item-icon
        icon-class="icon-transaction-history"
        :navigate-to="{ name: 'transactions', params: { filter: 'savings' } }"
        :text="$t('transactionHistory')"
      />

      <base-item-icon
        icon-class="icon-deposit"
        navigate-to="savings-deposit"
        :text="$t('depositInSavings')"
      />

      <base-item-icon
        icon-class="icon-withdraw"
        navigate-to="savings-withdraw"
        :text="$t('withdrawFromSavings')"
      />

      <base-item-icon
        icon-class="icon-analytics"
        navigate-to="savings-analytics"
        :text="$t('analytics')"
      />
    </template>

    <template #info>
      <div class="image">
        <!-- This is a stub, replace with the logic -->
      </div>

      <analytics-list
        class="compact"
        header-component="h2"
        :title="$t('infoAboutSavings')"
      >
        <analytics-list-item
          :description="variableAPY"
          :title="$t('currentVariableRate')"
        />

        <analytics-list-item
          :description="formattedBaseCurrencyTotalBalance"
          :title="$t('totalBalanceInBaseCurrency')"
        />

        <analytics-list-item
          :description="totalAmountEarned"
          :title="$t('totalAmountEarnedInSavings')"
        />

        <analytics-list-item
          :description="yieldStrategyLocation"
          :title="$t('yieldStrategyOn')"
        />
      </analytics-list>
    </template>
  </module-about>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { formatPercents } from '@/utils/format';
import { getNetwork, Network } from '@/utils/networkTypes';
import { getUSDCAssetData } from '@/wallet/references/data';
import { SmallTokenInfo } from '@/wallet/types';

import AnalyticsList from '@/components/analytics-list/analytics-list.vue';
import AnalyticsListItem from '@/components/analytics-list/analytics-list-item.vue';
import BaseItemIcon from '@/components/v1.2/home/portfolio/navigation-section/base-item-icon.vue';
import ModuleAbout from '@/components/v1.2/layout/module-about.vue';

export default Vue.extend({
  components: { AnalyticsListItem, ModuleAbout, BaseItemIcon, AnalyticsList },
  computed: {
    ...mapState('savings', {
      apy: 'savingsAPY'
    }),
    ...mapGetters('savings', {
      usdcTokenInfo: 'usdcTokenInfo',
      balanceNative: 'savingsInfoBalanceNative',
      balanceUSDC: 'savingsInfoBalanceUSDC',
      totalEarned: 'savingsInfoEarnedTotalNative',
      avg30DaysAPY: 'savingsAvg30DaysAPY'
    }),
    baseCurrency(): SmallTokenInfo {
      return getUSDCAssetData(Network.mainnet);
    },
    formattedNativeBalance(): string {
      return this.formatAsNativeCurrency(this.balanceNative);
    },
    formattedBaseCurrencyTotalBalance(): string {
      return this.formatAsCryptoWithSymbol(
        this.balanceUSDC,
        this.usdcTokenInfo.symbol
      );
    },
    variableAPY(): string {
      return `${formatPercents(this.apy ?? this.avg30DaysAPY)}%`;
    },
    totalAmountEarned(): string {
      return this.formatAsNativeCurrency(this.totalEarned);
    },
    yieldStrategyLocation(): string {
      return getNetwork(Network.mainnet)?.fullDisplayedName ?? Network.mainnet;
    }
  }
});
</script>
