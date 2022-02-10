<template>
  <secondary-page class="manage" hide-info>
    <template v-slot:title>
      <secondary-page-header
        :description="$t('treasury.lblTreasuryBalance')"
        :title="stakedBalance"
      />
    </template>

    <div class="chart-wrapper">
      <bar-chart
        :accent-color="chartColor"
        :chart-data-source="chartDataSource"
        :is-loading="isTreasuryInfoLoading || treasuryInfo === undefined"
        @item-selected="handleItemSelected"
      />
      <div class="bottom-text">
        {{ selectedItemPrefix }}
        <span class="emphasize">{{ selectedItemValue }}</span>
      </div>
    </div>

    <statements-nav-list
      :button-text="$t('treasury.btnView.simple')"
      :icon="$t('treasury.icon')"
      :in-progress-text="$t('treasury.lblInProgress')"
      :items="treasuryMonthStatsOptions"
      navigate-to-name="treasury-month-stats"
      :title="$t('treasury.lblSmartTreasuryStatements')"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { TreasuryMonthBonusesItem } from '@/services/mover';
import { fromWei, multiply } from '@/utils/bigmath';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';
import { getUSDCAssetData } from '@/wallet/references/data';

import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { StatementsNavList } from '@/components/statements-nav-list';

export default Vue.extend({
  name: 'TreasuryManage',
  components: {
    BarChart,
    SecondaryPageHeader,
    SecondaryPage,
    StatementsNavList
  },
  data() {
    return {
      monthName: dayjs().format('MMMM'),
      selectedItem: undefined as TreasuryMonthBonusesItem | undefined
    };
  },
  computed: {
    ...mapState({
      colors: 'colors'
    }),
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapState('treasury', {
      isTreasuryInfoLoading: 'isTreasuryInfoLoading',
      treasuryInfo: 'treasuryInfo'
    }),
    ...mapGetters('treasury', {
      treasuryBonusNative: 'treasuryBonusNative',
      treasuryEarnedThisMonthNative: 'treasuryEarnedThisMonthNative',
      treasuryMonthStatsOptions: 'treasuryMonthStatsOptions',
      usdcNativePrice: 'usdcNativePrice',
      treasuryStakedBalanceNative: 'treasuryStakedBalanceNative'
    }),
    stakedBalance(): string {
      return `$${formatToNative(this.treasuryStakedBalanceNative)}`;
    },
    earnedThisMonth(): string {
      return `$${formatToNative(this.treasuryEarnedThisMonthNative)}`;
    },
    chartDataSource(): Array<TreasuryMonthBonusesItem> {
      return this.treasuryInfo !== undefined
        ? this.treasuryInfo.last12MonthsBonuses
        : [];
    },
    selectedItemPrefix(): string {
      if (this.selectedItem === undefined) {
        return this.$t('treasury.lblEarnedRelativeMonthlyChange') as string;
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.$t('treasury.lblEarnedRelativeMonthlyChange') as string;
      }

      return this.$t(
        'treasury.lblEarnedRelativeMonthlyChangeExtendedMonthOnly',
        {
          date: dateFromExplicitPair(
            this.selectedItem.year,
            this.selectedItem.month
          ).format('MMMM')
        }
      ) as string;
    },
    selectedItemValue(): string {
      if (this.selectedItem === undefined) {
        return this.formatSelectedItemValue(this.treasuryEarnedThisMonthNative);
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.formatSelectedItemValue(this.treasuryEarnedThisMonthNative);
      }

      return this.formatSelectedItemValue(
        multiply(
          fromWei(
            this.selectedItem.bonusesEarned,
            getUSDCAssetData(this.networkInfo.network).decimals
          ),
          this.usdcNativePrice
        )
      );
    },
    chartColor(): string {
      return this.colors['product-treasury'];
    }
  },
  methods: {
    handleItemSelected(item: TreasuryMonthBonusesItem): void {
      this.selectedItem = item;
    },
    formatSelectedItemValue(value: string | number): string {
      if (this.networkInfo === undefined) {
        return `$0.00`;
      }

      const formattedValue = formatToNative(value);

      return `${getSignIfNeeded(formattedValue, '+')}$${formattedValue}`;
    }
  }
});
</script>
