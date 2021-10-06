<template>
  <div class="">
    <div class="savings__menu-wrapper-balance">
      <slot name="title">
        <span class="balance">{{ savingsBalance }}</span>
        <p class="balance">{{ $t('savings.lblSavingsBalance') }}</p>
      </slot>
    </div>
    <div class="savings__menu-wrapper-graph">
      <bar-chart
        :chart-data-source="chartDataSource"
        :is-loading="isSavingsInfoLoading || savingsInfo === undefined"
        @item-selected="handleItemSelected"
      />
      <slot>
        <p>
          {{ selectedItemPrefix }}
          <b>{{ selectedItemValue }}</b>
        </p>
      </slot>
    </div>
  </div>
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

export default Vue.extend({
  name: 'SavingsYearlyChartWrapper',
  components: { BarChart },
  data() {
    return {
      monthName: dayjs().format('MMMM'),
      selectedItem: undefined as SavingsMonthBalanceItem | undefined
    };
  },
  computed: {
    ...mapState('account', {
      savingsInfo: 'savingsInfo',
      isSavingsInfoLoading: 'isSavingsInfoLoading',
      networkInfo: 'networkInfo'
    }),
    ...mapGetters('account', {
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
