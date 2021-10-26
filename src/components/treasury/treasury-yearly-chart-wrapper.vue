<template>
  <div class="">
    <div class="smart-treasury__menu-wrapper-balance">
      <span class="balance">{{ bonusBalance }}</span>
      <p>{{ $t('treasury.lblTreasuryBalance') }}</p>
    </div>
    <div class="smart-treasury__menu-wrapper-graph">
      <bar-chart
        accent-color="#F593AE"
        :chart-data-source="chartDataSource"
        :is-loading="isTreasuryInfoLoading || treasuryInfo === undefined"
        @item-selected="handleItemSelected"
      />
      <p>
        {{ selectedItemPrefix }}
        <b>{{ selectedItemValue }}</b>
      </p>
    </div>
  </div>
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

export default Vue.extend({
  name: 'TreasuryYearlyChart',
  components: {
    BarChart
  },
  data() {
    return {
      monthName: dayjs().format('MMMM'),
      selectedItem: undefined as TreasuryMonthBonusesItem | undefined
    };
  },
  computed: {
    ...mapState('account', {
      isTreasuryInfoLoading: 'isTreasuryInfoLoading',
      treasuryInfo: 'treasuryInfo',
      networkInfo: 'networkInfo'
    }),
    ...mapGetters('account', {
      treasuryBonusNative: 'treasuryBonusNative',
      treasuryEarnedThisMonthNative: 'treasuryEarnedThisMonthNative',
      usdcNativePrice: 'usdcNativePrice'
    }),
    bonusBalance(): string {
      return `$${formatToNative(this.treasuryBonusNative)}`;
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
