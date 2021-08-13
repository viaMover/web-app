<template>
  <secondary-page has-heading-buttons>
    <template v-slot:title>
      <secondary-page-title
        :icon="$t('treasury.icon')"
        :title="$t('treasury.lblSmartTreasury')"
        wrapper-class="smart-treasury__menu-wrapper-title"
      >
        <template v-slot:context-menu>
          <context-button :popover-parent-id="popoverParentId">
            <context-button-item :text="$t('treasury.btnDeposit.emoji')" />
            <context-button-item :text="$t('treasury.btnWithdraw.emoji')" />
            <context-button-item :text="$t('treasury.btnClaimAndBurn.emoji')" />
          </context-button>
        </template>
      </secondary-page-title>
    </template>

    <treasury-yearly-chart-wrapper />
    <statement-nav-list
      :button-text="$t('treasury.btnView.simple')"
      icon="💰"
      :in-progress-text="$t('treasury.lblInProgress')"
      :items="treasuryMonthStatsOptions"
      navigate-to-name="treasury-month-stats"
      :title="$t('savings.lblSavingsStatements')"
      wrapper-class="smart-treasury__menu-wrapper-statements"
    />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { SecondaryPage, SecondaryPageTitle } from '@/components/layout';
import { ContextButton, ContextButtonItem } from '@/components/buttons';
import { StatementNavList } from '@/components/statements/statement-nav-list';
import { TreasuryYearlyChartWrapper } from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryManage',
  components: {
    SecondaryPage,
    SecondaryPageTitle,
    ContextButton,
    ContextButtonItem,
    TreasuryYearlyChartWrapper,
    StatementNavList
  },
  data() {
    return {
      popoverParentId: 'treasury-manage-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', {
      treasuryMonthStatsOptions: 'treasuryMonthStatsOptions'
    })
  }
});
</script>
