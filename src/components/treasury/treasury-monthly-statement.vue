<template>
  <analytics-list>
    <analytics-list-item
      :description="balance"
      :title="$t('treasury.statement.lblBalance', { month: monthName })"
    />
    <analytics-list-item
      :description="rewardsEarned"
      :title="$t('treasury.statement.lblRewardsEarned')"
    />
    <analytics-list-item
      :description="averageDailyEarnings"
      :title="$t('treasury.statement.lblAverageDailyEarnings')"
    />
    <analytics-list-item
      :description="rewardsUsed"
      :title="$t('treasury.statement.lblRewardsUsed')"
    />
    <analytics-list-item
      :description="averageDailySpendings"
      :title="$t('treasury.statement.lblAverageDailySpendings')"
    />
    <analytics-list-item
      :description="reservedAssets"
      :title="$t('treasury.statement.lblReservedAssets')"
    />
    <analytics-list-item
      :description="removedAssets"
      :title="$t('treasury.statement.lblRemovedAssets')"
    />
  </analytics-list>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import dayjs from 'dayjs';

import { TreasuryReceipt } from '@/services/mover';
import { SavingsGetReceiptPayload } from '@/store/modules/savings/types';
import { add, fromWei, multiply } from '@/utils/bigmath';
import { formatToNative, getSignIfNeeded } from '@/utils/format';
import {
  getMoveAssetData,
  getMoveWethLPAssetData,
  getUSDCAssetData
} from '@/wallet/references/data';

import { AnalyticsList, AnalyticsListItem } from '@/components/analytics-list';

export default Vue.extend({
  name: 'TreasuryMonthlyStatements',
  components: {
    AnalyticsListItem,
    AnalyticsList
  },
  props: {
    pageDate: {
      type: Object as PropType<dayjs.Dayjs>,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      isError: true,
      receipt: undefined as TreasuryReceipt | undefined
    };
  },
  computed: {
    ...mapGetters('treasury', {
      treasuryReceipt: 'treasuryReceipt',
      usdcNativePrice: 'usdcNativePrice',
      slpNativePrice: 'slpNativePrice',
      moveNativePrice: 'moveNativePrice'
    }),
    ...mapState('account', { networkInfo: 'networkInfo' }),
    balance(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined
      ) {
        return '0';
      }

      let moveBalanceNative = '0';
      if (this.receipt.endOfMonthBalanceMove > 0) {
        const moveBalance = fromWei(
          this.receipt.endOfMonthBalanceMove,
          getMoveAssetData(this.networkInfo.network).decimals
        );
        moveBalanceNative = multiply(moveBalance, this.moveNativePrice);
      }

      let moveLPBalanceNative = '0';
      if (this.receipt.endOfMonthBalanceMoveLP > 0) {
        const moveLPBalance = fromWei(
          this.receipt.endOfMonthBalanceMoveLP,
          getMoveWethLPAssetData(this.networkInfo.network).decimals
        );
        moveLPBalanceNative = multiply(moveLPBalance, this.slpNativePrice);
      }

      const treasuryMonthBalanceNative = add(
        moveBalanceNative,
        moveLPBalanceNative
      );

      return `$${formatToNative(treasuryMonthBalanceNative)}`;
    },
    rewardsEarned(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined ||
        this.receipt.earnedThisMonth === 0
      ) {
        return '0';
      }

      const treasuryMonthEarnedThisMonth = fromWei(
        this.receipt.earnedThisMonth,
        getUSDCAssetData(this.networkInfo.network).decimals
      );

      const treasuryMonthEarnedThisMonthNative = multiply(
        treasuryMonthEarnedThisMonth,
        this.usdcNativePrice
      );
      const value = formatToNative(treasuryMonthEarnedThisMonthNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    averageDailyEarnings(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined ||
        this.receipt.avgDailyEarnings === 0
      ) {
        return '0';
      }

      const treasuryMonthAvgDailyEarnings = fromWei(
        this.receipt.avgDailyEarnings,
        getUSDCAssetData(this.networkInfo.network).decimals
      );

      const treasuryMonthAvgDailyEarningsNative = multiply(
        treasuryMonthAvgDailyEarnings,
        this.usdcNativePrice
      );
      const value = formatToNative(treasuryMonthAvgDailyEarningsNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    rewardsUsed(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined ||
        this.receipt.spentThisMonth === 0
      ) {
        return '0';
      }

      const treasuryMonthBonusesUsed = fromWei(
        this.receipt.spentThisMonth,
        getUSDCAssetData(this.networkInfo.network).decimals
      );

      const treasuryMonthBonusesUsedNative = multiply(
        treasuryMonthBonusesUsed,
        this.usdcNativePrice
      );
      const value = formatToNative(treasuryMonthBonusesUsedNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    averageDailySpendings(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined ||
        this.receipt.avgDailySpendings === 0
      ) {
        return '0';
      }

      const treasuryMonthAvgDailySpendings = fromWei(
        this.receipt.avgDailySpendings,
        getUSDCAssetData(this.networkInfo.network).decimals
      );

      const treasuryMonthAvgDailySpendingsNative = multiply(
        treasuryMonthAvgDailySpendings,
        this.usdcNativePrice
      );
      const value = formatToNative(treasuryMonthAvgDailySpendingsNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    reservedAssets(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined
      ) {
        return '0';
      }

      let moveDepositsNative = '0';
      if (this.receipt.totalDepositsMove > 0) {
        const moveDeposits = fromWei(
          this.receipt.totalDepositsMove,
          getMoveAssetData(this.networkInfo.network).decimals
        );
        moveDepositsNative = multiply(moveDeposits, this.moveNativePrice);
      }

      let moveLPDepositsNative = '0';
      if (this.receipt.totalDepositsMoveLP > 0) {
        const moveLPDeposits = fromWei(
          this.receipt.totalDepositsMoveLP,
          getMoveWethLPAssetData(this.networkInfo.network).decimals
        );
        moveLPDepositsNative = multiply(moveLPDeposits, this.slpNativePrice);
      }

      const treasuryMonthDepositedNative = add(
        moveDepositsNative,
        moveLPDepositsNative
      );

      const value = formatToNative(treasuryMonthDepositedNative);
      return `${getSignIfNeeded(value, '+')}$${value}`;
    },
    removedAssets(): string {
      if (
        this.isLoading ||
        this.receipt === undefined ||
        this.networkInfo === undefined
      ) {
        return '0';
      }

      let moveWithdrawalsNative = '0';
      if (this.receipt.totalWithdrawalsMove > 0) {
        const moveWithdrawals = fromWei(
          this.receipt.totalWithdrawalsMove,
          getMoveAssetData(this.networkInfo.network).decimals
        );
        moveWithdrawalsNative = multiply(moveWithdrawals, this.moveNativePrice);
      }

      let moveLPWithdrawalsNative = '0';
      if (this.receipt.totalWithdrawalsMoveLP > 0) {
        const moveLPWithdrawals = fromWei(
          this.receipt.totalWithdrawalsMoveLP,
          getMoveWethLPAssetData(this.networkInfo.network).decimals
        );
        moveLPWithdrawalsNative = multiply(
          moveLPWithdrawals,
          this.slpNativePrice
        );
      }

      const treasuryMonthWithdrewNative = add(
        moveWithdrawalsNative,
        moveLPWithdrawalsNative
      );

      const value = formatToNative(treasuryMonthWithdrewNative);
      return `${getSignIfNeeded(value, '-')}$${value}`;
    },
    monthName(): string {
      return this.pageDate.format('MMMM');
    }
  },
  async mounted() {
    this.isLoading = true;

    const year = this.pageDate.get('year');
    const month = this.pageDate.get('month') + 1;

    this.fetchTreasuryReceipt({
      year,
      month
    } as SavingsGetReceiptPayload);

    let receipt: TreasuryReceipt | undefined;

    try {
      receipt = await this.treasuryReceipt(year, month);
      if (receipt === undefined) {
        throw new Error('receipt is undef');
      }
    } catch (e) {
      this.isLoading = false;
      this.isError = true;
      return;
    }

    this.receipt = receipt;
    this.isLoading = false;
  },
  methods: {
    ...mapActions('treasury', { fetchTreasuryReceipt: 'fetchTreasuryReceipt' })
  }
});
</script>
