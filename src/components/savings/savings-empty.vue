<template>
  <secondary-page hide-title>
    <div class="savings__menu-wrapper-graph">
      <div class="savings__menu-wrapper-balance">
        <span class="balance">{{ savingsBalance }}</span>
        <p class="black">{{ $t('savings.txtYouCouldApproximately') }}</p>
      </div>
      <bar-chart
        :chart-data-source="chartDataSource"
        disable-selecting
        :is-loading="false"
      />
      <p class="margin-top">{{ $t('savings.txtIfYouDeposit') }}</p>
      <div class="savings__menu-wrapper-body">
        <span class="title">{{ currentVariableAPY }}</span>
        <p class="description black">{{ $t('savings.lblAPYOnAllSavings') }}</p>
        <action-button
          button-class="button button-active bold"
          :text="$t('savings.lblStartSaving')"
          @button-click="handleDepositClick"
        />
      </div>
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';

import { SavingsMonthBalanceItem } from '@/services/mover';
import { Modal as ModalType } from '@/store/modules/modals/types';
import { divide, multiply } from '@/utils/bigmath';
import { formatPercents, formatToNative } from '@/utils/format';

import ActionButton from '@/components/buttons/action-button.vue';
import { BarChart } from '@/components/charts';
import { SecondaryPage } from '@/components/layout';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

export default Vue.extend({
  name: 'SavingsEmpty',
  components: {
    ActionButton,
    SecondaryPage,
    BarChart
  },
  data() {
    return {
      popoverParentId: 'savings-empty-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', { hasActiveSavings: 'hasActiveSavings' }),
    ...mapState('account', { apy: 'savingsAPY' }),
    savingsBalance(): string {
      const apyNative = multiply(divide(this.apy, '100'), '10000');
      return `~ $${formatToNative(apyNative)}`;
    },
    currentVariableAPY(): string {
      return `${formatPercents(this.apy)}%`;
    },
    chartDataSource(): Array<SavingsMonthBalanceItem> {
      return Array.from(Array(10).keys()).map((n) => ({
        type: 'savings_month_balance_item',
        balance: 100,
        earned: n,
        snapshotTimestamp: n,
        year: 2000 + n,
        month: 1 + n
      }));
    }
  },
  watch: {
    hasActiveSavings(newVal: boolean) {
      if (newVal) {
        this.replaceActiveSavingsRoute();
      }
    }
  },
  beforeMount() {
    if (this.hasActiveSavings) {
      this.replaceActiveSavingsRoute();
    }
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    replaceActiveSavingsRoute(): void {
      this.$router.replace({
        name: 'savings-manage'
      });
    },
    toggleDeposit(): void {
      this.setModalIsDisplayed({
        id: ModalType.SavingsDeposit,
        value: true,
        payload: {}
      });
    },
    async handleDepositClick(): Promise<void> {
      await this.$router.push({
        name: 'savings-deposit'
      });
    }
  }
});
</script>
