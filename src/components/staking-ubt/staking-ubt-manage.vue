<template>
  <secondary-page class="manage">
    <template v-slot:title>
      <secondary-page-header
        :description="$t('stakingUBT.lblBalance')"
        :title="balance"
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
      :button-text="$t('stakingUBT.btnView')"
      icon="🥩"
      :in-progress-text="$t('stakingUBT.lblInProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="staking-ubt-month-stats"
      :title="$t('stakingUBT.lblStakingStatements')"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { StakingUbtMonthBalanceItem } from '@/services/v2/api/mover/staking-ubt';
import { fromWei, multiply } from '@/utils/bigmath';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import { dateFromExplicitPair } from '@/utils/time';
import { getUSDCAssetData } from '@/wallet/references/data';

import { BarChart } from '@/components/charts';
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
      selectedItem: undefined as StakingUbtMonthBalanceItem | undefined
    };
  },
  computed: {
    ...mapState({ colors: 'colors' }),
    ...mapState('account', {
      networkInfo: 'networkInfo'
    }),
    ...mapState('stakingUBT', {
      isInfoLoading: 'isInfoLoading'
    }),
    ...mapGetters('stakingUBT', {
      info: 'info',
      savingsMonthStatsOptions: 'savingsMonthStatsOptions',
      balanceNative: 'balanceNative',
      earnedThisMonthNative: 'earnedThisMonthNative',
      usdcNativePrice: 'usdcNativePrice'
    }),
    balance(): string {
      return `$${formatToNative(this.balanceNative)}`;
    },
    chartDataSource(): Array<StakingUbtMonthBalanceItem> {
      return this.info !== undefined ? this.info.last12MonthsBalances : [];
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

      return this.$t('savings.txtYieldEarnedIn', {
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
    handleItemSelected(item: StakingUbtMonthBalanceItem): void {
      this.selectedItem = item;
    },
    formatSelectedItemValue(value: string | number): string {
      return `${getSignIfNeeded(value, '+')}$${formatToNative(value)}`;
    }
  }
});
</script>
