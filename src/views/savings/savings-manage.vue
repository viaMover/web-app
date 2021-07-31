<template>
  <secondary-page has-heading-buttons>
    <template v-slot:title>
      <secondary-page-title
        :icon="$t('savings.icon')"
        :title="$t('savings.lblSavings')"
        wrapper-class="savings__menu-wrapper-title"
      >
        <template v-slot:context-menu>
          <context-button :popover-parent-id="popoverParentId">
            <context-button-item
              :text="$t('savings.btnDeposit.emoji')"
              @click="handleDepositClick"
            />
            <context-button-item
              :text="$t('savings.btnWithdraw.emoji')"
              @click="handleWithdrawClick"
            />
          </context-button>
        </template>
      </secondary-page-title>
    </template>

    <savings-yearly-chart-wrapper />
    <statement-nav-list
      :button-text="$t('savings.btnView.simple')"
      icon="💰"
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
import { mapGetters } from 'vuex';

import { SecondaryPage, SecondaryPageTitle } from '@/components/layout';
import { ContextButton, ContextButtonItem } from '@/components/buttons';
import { StatementNavList } from '@/components/statements/statement-nav-list';
import { SavingsYearlyChartWrapper } from '@/components/savings';
import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';

export default Vue.extend({
  name: 'SavingsManage',
  components: {
    ContextButton,
    ContextButtonItem,
    SecondaryPageTitle,
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
    handleDepositClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      toggleSingleItem(Modal.SavingsDeposit);
    },
    handleWithdrawClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      toggleSingleItem(Modal.SavingsWithdraw);
    }
  }
});
</script>
