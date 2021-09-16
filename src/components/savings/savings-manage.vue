<template>
  <secondary-page>
    <savings-yearly-chart-wrapper />
    <statement-nav-list
      :button-text="$t('savings.btnView.simple')"
      :icon="$t('savings.icon')"
      :in-progress-text="$t('savings.lblInProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="savings-month-stats"
      :title="$t('savings.lblSavingsStatements')"
      wrapper-class="savings__menu-wrapper-statements"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

import { Modal as ModalType } from '@/store/modules/modals/types';
import { toggleSingleItem } from '@/components/toggle/toggle-root';

import { SecondaryPage } from '@/components/layout';
import { StatementNavList } from '@/components/statements/statement-nav-list';
import { SavingsYearlyChartWrapper } from '@/components/savings';

export default Vue.extend({
  name: 'SavingsManage',
  components: {
    SecondaryPage,
    SavingsYearlyChartWrapper,
    StatementNavList
  },
  data() {
    return {
      popoverParentId: 'savings-manage-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', {
      savingsMonthStatsOptions: 'savingsMonthStatsOptions'
    })
  },
  methods: {
    ...mapActions('modals', { setModalIsDisplayed: 'setIsDisplayed' }),
    handleDepositClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({
        id: ModalType.SavingsDeposit,
        value: true,
        payload: {}
      });
    },
    handleWithdrawClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      this.setModalIsDisplayed({
        id: ModalType.SavingsWithdraw,
        value: true,
        payload: {}
      });
    }
  }
});
</script>
