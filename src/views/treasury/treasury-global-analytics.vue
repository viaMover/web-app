<template>
  <secondary-page
    class="analytics"
    has-back-button
    hide-info
    @back="handleBack"
  >
    <template v-slot:title>
      <secondary-page-header
        :description="$t('treasury.txtTreasuryOverviewDescription')"
        :title="$t('treasury.lblTreasuryOverview')"
      />
    </template>

    <analytics-list>
      <analytics-list-item
        :description="reservedAssetsValue"
        :title="$t('treasury.lblReservedAssetsValue')"
      />
      <analytics-list-item
        :description="currentBoost"
        :title="$t('treasury.lblCurrentBoost')"
      />
      <analytics-list-item
        :description="maximumBoost"
        :title="$t('treasury.lblMaximumBoost')"
      />
      <analytics-list-item
        :description="smartTreasurySize"
        :title="$t('treasury.lblSmartTreasurySize')"
      />
    </analytics-list>
    <analytics-list :title="$t('treasury.lblTreasuryStats')">
      <analytics-list-item
        :description="earnedToday"
        :title="$t('treasury.lblEarnedToday')"
      />
      <analytics-list-item
        :description="earnedThisMonth"
        :title="$t('treasury.lblEarnedThisMonth')"
      />
      <analytics-list-item
        :description="earnedInTotal"
        :title="$t('treasury.lblEarnedInTotal')"
      />
      <analytics-list-item
        :description="spentToday"
        :title="$t('treasury.lblSpentToday')"
      />
      <analytics-list-item
        :description="spentThisMonth"
        :title="$t('treasury.lblSpentThisMonth')"
      />
      <analytics-list-item
        :description="spentInTotal"
        :title="$t('treasury.lblSpentInTotal')"
      />
    </analytics-list>
    <analytics-list :title="$t('treasury.lblReservedAssets')">
      <analytics-list-item
        v-for="asset in assets"
        :key="asset.name"
        :title="asset.name"
      >
        {{ asset.amount }}
        <template v-if="asset.displaySymbol">
          {{ asset.symbol }}
        </template>
      </analytics-list-item>
    </analytics-list>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import {
  formatToDecimals,
  formatToNative,
  getSignIfNeeded
} from '@/utils/format';
import {
  getMoveAssetData,
  getMoveWethLPAssetData
} from '@/wallet/references/data';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';
import {
  SecondaryPage,
  SecondaryPageHeader
} from '@/components/layout/secondary-page';
import { ReservedAsset } from '@/components/treasury/treasury-reserved-assets/types';

export default Vue.extend({
  name: 'TreasuryGlobalAnalytics',
  components: {
    SecondaryPage,
    SecondaryPageHeader,
    AnalyticsListItem,
    AnalyticsList
  },
  data() {
    return {
      maximumBoost: '3.5x'
    };
  },
  computed: {
    ...mapGetters('treasury', {
      treasuryStakedBalanceNative: 'treasuryStakedBalanceNative',
      treasuryBoost: 'treasuryBoost',
      treasuryTotalStakedBalanceNative: 'treasuryTotalStakedBalanceNative',
      treasuryEarnedTodayNative: 'treasuryEarnedTodayNative',
      treasuryEarnedThisMonthNative: 'treasuryEarnedThisMonthNative',
      treasuryEarnedTotalNative: 'treasuryEarnedTotalNative',
      treasurySpentTodayNative: 'treasurySpentTodayNative',
      treasurySpentThisMonthNative: 'treasurySpentThisMonthNative',
      treasurySpentTotalNative: 'treasurySpentTotalNative',
      treasuryStakedMove: 'treasuryStakedMove',
      treasuryStakedMoveLP: 'treasuryStakedMoveLP'
    }),
    ...mapState('treasury', {
      powercardState: 'powercardState',
      networkInfo: 'networkInfo',
      treasuryTotalStakedMove: 'treasuryTotalStakedMove',
      treasuryTotalStakedMoveEthLP: 'treasuryTotalStakedMoveEthLP'
    }),
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    formattedMoveAmount(): string {
      const moveAmountNative = this.treasuryStakedMove;
      return formatToDecimals(moveAmountNative, 4);
    },
    formattedMoveEthLPAmount(): string {
      const moveEthLPAmountNative = this.treasuryStakedMoveLP;
      return formatToDecimals(moveEthLPAmountNative, 4);
    },
    isPowercardStaked(): boolean {
      return this.powercardState === 'Staked';
    },
    assets(): Array<ReservedAsset> {
      if (this.networkInfo === undefined) {
        return [];
      }

      const network = this.networkInfo.network;

      const moveAsset = getMoveAssetData(network);
      const moveEthLPAsset = getMoveWethLPAssetData(network);
      return [
        {
          name: 'MOVE',
          symbol: moveAsset.symbol,
          displaySymbol: true,
          amount: this.formattedMoveAmount
        },
        {
          name: 'MOVE-ETH LP',
          symbol: moveEthLPAsset.symbol,
          displaySymbol: true,
          amount: this.formattedMoveEthLPAmount
        },
        {
          name: 'The Powercard',
          symbol: 'RARIBLE 1155',
          displaySymbol: false,
          amount: this.isPowercardStaked ? '1' : '0'
        }
      ];
    },
    earnedToday(): string {
      const value = formatToNative(this.treasuryEarnedTodayNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedThisMonth(): string {
      const value = formatToNative(this.treasuryEarnedThisMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    earnedInTotal(): string {
      const value = formatToNative(this.treasuryEarnedTotalNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    spentToday(): string {
      const value = formatToNative(this.treasurySpentTodayNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    spentThisMonth(): string {
      const value = formatToNative(this.treasurySpentThisMonthNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    spentInTotal(): string {
      const value = formatToNative(this.treasurySpentTotalNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    reservedAssetsValue(): string {
      return `$${formatToNative(this.treasuryStakedBalanceNative)}`;
    },
    currentBoost(): string {
      return `${formatToDecimals(this.treasuryBoost, 2)}x`;
    },
    smartTreasurySize(): string {
      return `$${formatToNative(this.treasuryTotalStakedBalanceNative)}`;
    }
  },
  methods: {
    handleBack(): void {
      this.$router.replace({
        name: 'treasury-manage'
      });
    }
  }
});
</script>
