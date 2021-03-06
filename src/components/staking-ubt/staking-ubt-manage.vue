<template>
  <secondary-page class="manage">
    <template v-slot:title>
      <secondary-page-header :title="displayBalance">
        <template v-slot:description>
          <div class="description">
            {{ $t('stakingUBT.lblBalanceIn') }}
            <span class="selector button-like" @click="handleToggleBalanceMode">
              {{ currentBalanceSymbol }}
            </span>
          </div>
        </template>
      </secondary-page-header>
    </template>

    <div class="chart-wrapper">
      <bar-chart
        :accent-color="chartAccentColor"
        :chart-data-source="chartDataSource"
        :is-loading="isInfoLoading || info === undefined"
        @item-selected="handleItemSelected"
      />
      <div class="bottom-text">
        {{ selectedItemPrefix }}
        <span class="emphasize">{{ selectedItemValue }}</span>
      </div>
    </div>

    <statements-nav-list
      :button-text="$t('stakingUBT.btnView')"
      icon="🌻"
      :in-progress-text="$t('stakingUBT.lblInProgress')"
      :items="monthStatsOptions"
      navigate-to-name="staking-ubt-month-stats"
      :title="$t('stakingUBT.lblStakingStatements')"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import { BigNumber } from 'bignumber.js';
import dayjs from 'dayjs';

import { StakingUbtMonthBalanceItem } from '@/services/v2/api/mover/staking-ubt';
import { fromWei, multiply } from '@/utils/bigmath';
import {
  formatToDecimals,
  formatToNative,
  getSignIfNeeded
} from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';
import { getUBTAssetData } from '@/wallet/references/data';
import { SmallTokenInfoWithIcon } from '@/wallet/types';

import { BarChart } from '@/components/charts';
import { InputMode } from '@/components/forms';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { StatementsNavList } from '@/components/statements-nav-list';

export default Vue.extend({
  name: 'StakingUbtManage',
  components: {
    BarChart,
    SecondaryPageHeader,
    SecondaryPage,
    StatementsNavList
  },
  data() {
    return {
      monthName: dayjs().format('MMMM'),
      selectedItem: undefined as StakingUbtMonthBalanceItem | undefined,
      balanceMode: 'NATIVE' as InputMode
    };
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('account', {
      networkInfo: 'networkInfo',
      nativeCurrency: 'nativeCurrency'
    }),
    ...mapState('stakingUBT', {
      isInfoLoading: 'isInfoLoading'
    }),
    ...mapGetters('stakingUBT', {
      info: 'info',
      monthStatsOptions: 'monthStatsOptions',
      balanceNative: 'balanceNative',
      balance: 'balance',
      earnedThisMonthNative: 'earnedThisMonthNative',
      ubtNativePrice: 'ubtNativePrice'
    }),
    currentBalanceSymbol(): string {
      if (this.balanceMode === 'TOKEN') {
        return this.ubtAssetData.symbol;
      } else {
        return this.nativeCurrencySymbol;
      }
    },
    nativeCurrencySymbol(): string {
      return this.nativeCurrency.toUpperCase();
    },
    displayBalance(): string {
      if (this.balanceMode === 'TOKEN') {
        return formatToDecimals(this.balance, 4, BigNumber.ROUND_DOWN);
      }
      return this.formatAsNativeCurrency(this.balanceNative);
    },
    chartDataSource(): Array<StakingUbtMonthBalanceItem> {
      return this.info !== undefined ? this.info.last12MonthsBalances : [];
    },
    ubtAssetData(): SmallTokenInfoWithIcon {
      return getUBTAssetData(this.networkInfo.network);
    },
    selectedItemPrefix(): string {
      if (this.selectedItem === undefined) {
        return this.$t('stakingUBT.txtYieldEarnedThisMonth') as string;
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.$t('stakingUBT.txtYieldEarnedThisMonth') as string;
      }

      return this.$t('stakingUBT.txtYieldEarnedIn', {
        date: dateFromExplicitPair(
          this.selectedItem.year,
          this.selectedItem.month
        ).format('MMMM')
      }) as string;
    },
    selectedItemValue(): string {
      if (this.selectedItem === undefined) {
        return this.formatSelectedItemValue(this.earnedThisMonthNative);
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.formatSelectedItemValue(this.earnedThisMonthNative);
      }

      return this.formatSelectedItemValue(
        multiply(
          fromWei(this.selectedItem.earned, this.ubtAssetData.decimals),
          this.ubtNativePrice
        )
      );
    },
    chartAccentColor(): string {
      return this.colors['product-staking-ubt'];
    }
  },
  methods: {
    handleItemSelected(item: StakingUbtMonthBalanceItem): void {
      this.selectedItem = item;
    },
    formatSelectedItemValue(value: string | number): string {
      return `${getSignIfNeeded(value, '+')}$${formatToNative(value)}`;
    },
    handleToggleBalanceMode(): void {
      if (this.balanceMode === 'NATIVE') {
        this.balanceMode = 'TOKEN';
        return;
      }
      this.balanceMode = 'NATIVE';
    }
  }
});
</script>
