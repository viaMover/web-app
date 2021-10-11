<template>
  <secondary-page has-back-button hide-title @back="handleBack">
    <secondary-page-simple-title
      class="page-title"
      :description="$t('treasury.txtTreasuryOverviewDescription')"
      :title="$t('treasury.lblTreasuryOverview')"
    />
    <statement-list>
      <statement-list-item
        :description="$t('treasury.lblReservedAssetsValue')"
        :value="reservedAssetsValue"
      />
      <statement-list-item
        :description="$t('treasury.lblCurrentBoost')"
        :value="currentBoost"
      />
      <statement-list-item
        :description="$t('treasury.lblMaximumBoost')"
        :value="maximumBoost"
      />
      <statement-list-item
        :description="$t('treasury.lblSmartTreasurySize')"
        :value="smartTreasurySize"
      />
    </statement-list>
    <statement-list :title="$t('treasury.lblTreasuryStats')">
      <statement-list-item
        :description="$t('treasury.lblEarnedToday')"
        :value="earnedToday"
      />
      <statement-list-item
        :description="$t('treasury.lblEarnedThisMonth')"
        :value="earnedThisMonth"
      />
      <statement-list-item
        :description="$t('treasury.lblEarnedInTotal')"
        :value="earnedInTotal"
      />
      <statement-list-item
        :description="$t('treasury.lblSpentToday')"
        :value="spentToday"
      />
      <statement-list-item
        :description="$t('treasury.lblSpentThisMonth')"
        :value="spentThisMonth"
      />
      <statement-list-item
        :description="$t('treasury.lblSpentInTotal')"
        :value="spentInTotal"
      />
    </statement-list>
    <statement-list :title="$t('treasury.lblReservedAssets')">
      <statement-list-item
        v-for="asset in assets"
        :key="asset.name"
        :description="asset.name"
      >
        {{ asset.amount }}
        <template v-if="asset.displaySymbol">
          {{ asset.symbol }}
        </template>
      </statement-list-item>
    </statement-list>
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

import {
  SecondaryPage,
  SecondaryPageSimpleTitle
} from '@/components/layout/secondary-page';
import {
  StatementList,
  StatementListItem
} from '@/components/statements/statement-list';
import { ReservedAsset } from '@/components/treasury/treasury-reserved-assets/types';

export default Vue.extend({
  name: 'TreasuryGlobalAnalytics',
  components: {
    SecondaryPage,
    SecondaryPageSimpleTitle,
    StatementListItem,
    StatementList
  },
  data() {
    return {
      maximumBoost: '3.5x'
    };
  },
  computed: {
    ...mapGetters('account', {
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
    ...mapState('account', [
      'networkInfo',
      'treasuryTotalStakedMove',
      'treasuryTotalStakedMoveEthLP'
    ]),
    formattedMoveAmount(): string {
      const moveAmountNative = this.treasuryStakedMove;
      return formatToDecimals(moveAmountNative, 4);
    },
    formattedMoveEthLPAmount(): string {
      const moveEthLPAmountNative = this.treasuryStakedMoveLP;
      return formatToDecimals(moveEthLPAmountNative, 4);
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
          amount: '0'
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
      this.$router.back();
    }
  }
});
</script>
