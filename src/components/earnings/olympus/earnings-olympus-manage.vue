<template>
  <secondary-page hide-title>
    <div>
      <secondary-page-simple-title
        class="manage-balance-wrapper"
        :description="$t('earnings.lblEarningsBalance')"
        :title="olympusBalance"
      />
      <div class="manage-graph-wrapper">
        <bar-chart
          :chart-data-source="chartDataSource"
          :is-loading="isOlympusInfoLoading || olympusInfo === undefined"
          @item-selected="handleItemSelected"
        />
        <p>
          {{ selectedItemPrefix }}
          <b>{{ selectedItemValue }}</b>
        </p>
      </div>
    </div>
    <statement-nav-list
      :button-text="$t('earnings.btnView')"
      :icon="$t('earnings.icon')"
      :in-progress-text="$t('earnings.lblInProgress')"
      :items="olympusMonthStatsOptions"
      navigate-to-name="earnings-month-stats"
      :title="$t('earnings.lblEarningsStatements')"
      wrapper-class="manage-statements-list"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { OlympusMonthBalanceItem } from '@/services/mover/earnings/types';
import { fromWei, multiply } from '@/utils/bigmath';
import {
  formatPercents,
  formatToNative,
  getSignIfNeeded
} from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';
import { getUSDCAssetData } from '@/wallet/references/data';

import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import { StatementNavList } from '@/components/statements/statement-nav-list';

export default Vue.extend({
  name: 'EarningsOlympusManage',
  components: {
    StatementNavList,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    BarChart
  },
  data() {
    return {
      selectedItem: undefined as OlympusMonthBalanceItem | undefined
    };
  },
  computed: {
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapGetters('account', {
      usdcNativePrice: 'usdcNativePrice'
    }),
    ...mapState('earnings/olympus', {
      apy: 'olympusAPY',
      olympusBalance: 'olympusBalance',
      olympusInfo: 'olympusInfo',
      isOlympusInfoLoading: 'isOlympusInfoLoading'
    }),
    ...mapGetters('earnings/olympus', {
      olympusMonthStatsOptions: 'olympusMonthStatsOptions',
      olympusInfoEarnedThisMonthNative: 'olympusInfoEarnedThisMonthNative',
      apyNative: 'apyNative'
    }),
    chartDataSource(): Array<OlympusMonthBalanceItem> {
      return this.olympusInfo !== undefined
        ? this.olympusInfo.last12MonthsBalances
        : [];
    },
    selectedItemPrefix(): string {
      if (this.selectedItem === undefined) {
        return this.$t('savings.lblEarnedRelativeMonthlyChange') as string;
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.$t('savings.lblEarnedRelativeMonthlyChange') as string;
      }

      return this.$t(
        'savings.lblEarnedRelativeMonthlyChangeExtendedMonthOnlyPrefix',
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
          this.olympusInfoEarnedThisMonthNative
        );
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.formatSelectedItemValue(
          this.olympusInfoEarnedThisMonthNative
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
    }
  },
  methods: {
    handleItemSelected(item: OlympusMonthBalanceItem): void {
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
