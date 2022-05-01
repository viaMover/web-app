<template>
  <secondary-page class="manage">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('savingsPlus.lblSPBalance')"
        :title="savingsBalance"
      />
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
      :button-text="$t('savingsPlus.btn.view')"
      :icon="$t('savingsPlus.icon')"
      :in-progress-text="$t('savingsPlus.lblInProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="savings-plus-month-stats"
      :title="$t('savingsPlus.lblSPStatements')"
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
import { SecondaryPage, SecondaryPageHeader } from '@/components/layout';
import { StatementsNavList } from '@/components/statements-nav-list';

export default Vue.extend({
  name: 'SavingsPlusManage',
  components: {
    BarChart,
    SecondaryPageHeader,
    SecondaryPage,
    StatementsNavList
  },
  data() {
    return {
      monthName: dayjs().format('MMMM'),
      selectedItem: undefined as SavingsMonthBalanceItem | undefined
    };
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapState('savingsPlus', {
      isInfoLoading: 'isInfoLoading'
    }),
    ...mapGetters('savingsPlus', {
      info: 'info',
      monthStatsOptions: 'monthStatsOptions',
      infoBalanceNative: 'infoBalanceNative',
      infoEarnedThisMonthNative: 'infoEarnedThisMonthNative',
      usdcNativePrice: 'usdcNativePrice',
      savingsMonthStatsOptions: 'savingsMonthStatsOptions'
    }),
    savingsBalance(): string {
      return `$${formatToNative(this.infoBalanceNative)}`;
    },
    chartDataSource(): Array<SavingsMonthBalanceItem> {
      return this.info !== undefined ? this.info.last12MonthsBalances : [];
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
        return this.formatSelectedItemValue(this.infoEarnedThisMonthNative);
      }

      const now = dayjs();
      if (
        this.selectedItem.month - 1 == now.get('month') &&
        this.selectedItem.year == now.get('year')
      ) {
        return this.formatSelectedItemValue(this.infoEarnedThisMonthNative);
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
    chartAccentColor(): string {
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
