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
            <context-button-item
              :text="$t('treasury.btnDeposit.emoji')"
              @click="handleDepositClick"
            />
            <context-button-item
              :text="$t('treasury.btnWithdraw.emoji')"
              @click="handleWithdrawClick"
            />
            <context-button-item
              :text="$t('treasury.btnClaimAndBurn.emoji')"
              @click="handleClaimAndBurnClick"
            />
          </context-button>
        </template>
      </secondary-page-title>
    </template>

    <treasury-yearly-chart-wrapper />
    <statement-nav-list
      :button-text="$t('treasury.btnView.simple')"
      :icon="$t('treasury.icon')"
      :in-progress-text="$t('treasury.lblInProgress')"
      :items="treasuryMonthStatsOptions"
      navigate-to-name="treasury-month-stats"
      :title="$t('treasury.lblTreasuryStatements')"
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
import { toggleSingleItem } from '@/components/toggle/toggle-root';
import { Modal } from '@/components/modals';

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
  },
  methods: {
    handleDepositClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      toggleSingleItem(Modal.TreasuryIncreaseBoost);
    },
    handleWithdrawClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      toggleSingleItem(Modal.TreasuryDecreaseBoost);
    },
    handleClaimAndBurnClick(): void {
      toggleSingleItem(this.popoverParentId + '__popover');
      toggleSingleItem(Modal.TreasuryClaimAndBurn);
    }
  }
});
</script>
