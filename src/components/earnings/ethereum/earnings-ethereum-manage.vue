<template>
  <secondary-page class="manage">
    <template v-slot:title>
      <secondary-page-header
        class="manage-balance-wrapper"
        :description="$t('earnings.lblEarningsBalance')"
        :title="ethereumBalance"
      />
    </template>

    <div class="manage-graph-wrapper">
      <bar-chart
        :accent-color="chartAccentColor"
        :chart-data-source="chartDataSource"
        :is-loading="isEthereumInfoLoading || ethereumInfo === undefined"
        @item-selected="handleItemSelected"
      />
      <p>
        {{ selectedItemPrefix }}
        <b>{{ selectedItemValue }}</b>
      </p>
    </div>

    <statements-nav-list
      :button-text="$t('earnings.btnView')"
      icon="🌻"
      :in-progress-text="$t('earnings.lblInProgress')"
      :items="ethereumMonthStatsOptions"
      navigate-to-name="earnings-ethereum-month-stats"
      :title="$t('earnings.lblEarningsStatements')"
      wrapper-class="manage-statements-list"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { EthereumMonthBalanceItem } from '@/services/mover/earnings/ethereum/types';
import { fromWei, multiply } from '@/utils/bigmath';
import {
  formatPercents,
  formatToNative,
  getSignIfNeeded
} from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';
import { getUSDCAssetData } from '@/wallet/references/data';

import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { StatementsNavList } from '@/components/statements-nav-list';

export default Vue.extend({
  name: 'EarningsEthereumManage',
  components: {
    StatementsNavList,
    SecondaryPageHeader,
    SecondaryPage,
    BarChart
  },
  data() {
    return {
      selectedItem: undefined as EthereumMonthBalanceItem | undefined
    };
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice'
    }),
    ...mapState('earnings/ethereum', {
      apy: 'ethereumAPY',
      ethereumBalance: 'ethereumBalance',
      ethereumInfo: 'ethereumInfo',
      isEthereumInfoLoading: 'isEthereumInfoLoading'
    }),
    ...mapGetters('earnings/ethereum', {
      ethereumMonthStatsOptions: 'ethereumMonthStatsOptions',
      ethereumInfoEarnedThisMonthNative: 'ethereumInfoEarnedThisMonthNative',
      apyNative: 'apyNative'
    }),
    chartDataSource(): Array<EthereumMonthBalanceItem> {
      return this.ethereumInfo !== undefined
        ? this.ethereumInfo.last12MonthsBalances
        : [];
    },
    selectedItemPrefix(): string {
      if (this.selectedItem === undefined) {
        return this.$t('earnings.lblEarnedRelativeMonthlyChange') as string;
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.$t('earnings.lblEarnedRelativeMonthlyChange') as string;
      }

      return this.$t(
        'earnings.lblEarnedRelativeMonthlyChangeExtendedMonthOnlyPrefix',
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
        return this.formatSelectedItemValue(
          this.ethereumInfoEarnedThisMonthNative
        );
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.formatSelectedItemValue(
          this.ethereumInfoEarnedThisMonthNative
        );
      }

      return this.formatSelectedItemValue(
        multiply(
          fromWei(
            this.selectedItem.earned,
            getUSDCAssetData(this.networkInfo.network).decimals
          ),
          this.usdcNativePrice
        )
      );
    },
    savingsBalance(): string {
      return `~ $${formatToNative(this.apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartAccentColor(): string {
      return this.colors['product-earnings'];
    }
  },
  methods: {
    handleItemSelected(item: EthereumMonthBalanceItem): void {
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
