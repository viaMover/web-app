<template>
  <secondary-page hide-title>
    <div>
      <secondary-page-simple-title
        class="manage-balance-wrapper"
        :description="$t('savings.lblSavingsBalance')"
        :title="savingsBalance"
      />
      <div class="manage-graph-wrapper">
        <bar-chart
          :accent-color="chartColor"
          :chart-data-source="chartDataSource"
          :is-loading="isSavingsInfoLoading || savingsInfo === undefined"
          @item-selected="handleItemSelected"
        />
        <p>
          {{ selectedItemPrefix }}
          <b>{{ selectedItemValue }}</b>
        </p>
      </div>
    </div>
    <statement-nav-list
      :button-text="$t('savings.btnView.simple')"
      :icon="$t('savings.icon')"
      :in-progress-text="$t('savings.lblInProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="savings-month-stats"
      :title="$t('savings.lblSavingsStatements')"
      wrapper-class="manage-statements-list"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { SavingsMonthBalanceItem } from '@/services/mover';
import { fromWei, multiply } from '@/utils/bigmath';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';
import { getUSDCAssetData } from '@/wallet/references/data';

import { BarChart } from '@/components/charts';
import { SecondaryPage, SecondaryPageSimpleTitle } from '@/components/layout';
import { StatementNavList } from '@/components/statements/statement-nav-list';

export default Vue.extend({
  name: 'SavingsManage',
  components: {
    BarChart,
    SecondaryPageSimpleTitle,
    SecondaryPage,
    StatementNavList
  },
  data() {
    return {
      monthName: dayjs().format('MMMM'),
      selectedItem: undefined as SavingsMonthBalanceItem | undefined
    };
  },
  computed: {
    ...mapState({
      colors: 'colors'
    }),
    ...mapState('account', {
      savingsInfo: 'savingsInfo',
      isSavingsInfoLoading: 'isSavingsInfoLoading',
      networkInfo: 'networkInfo'
    }),
    ...mapGetters('account', {
      savingsMonthStatsOptions: 'savingsMonthStatsOptions',
      savingsInfoBalanceNative: 'savingsInfoBalanceNative',
      savingsInfoEarnedThisMonthNative: 'savingsInfoEarnedThisMonthNative',
      usdcNativePrice: 'usdcNativePrice'
    }),
    savingsBalance(): string {
      return `$${formatToNative(this.savingsInfoBalanceNative)}`;
    },
    chartDataSource(): Array<SavingsMonthBalanceItem> {
      return this.savingsInfo !== undefined
        ? this.savingsInfo.last12MonthsBalances
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
          this.savingsInfoEarnedThisMonthNative
        );
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.formatSelectedItemValue(
          this.savingsInfoEarnedThisMonthNative
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
    chartColor(): string {
      return this.colors['product-savings'];
    }
  },
  methods: {
    handleItemSelected(item: SavingsMonthBalanceItem): void {
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
