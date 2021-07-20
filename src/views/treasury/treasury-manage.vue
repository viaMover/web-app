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

    <treasury-yearly-chart />
    <statement-nav-list
      :button-text="$t('treasury.btnView.simple')"
      icon="💰"
      :in-progress-text="$t('treasury.lblInProgress')"
      :items="savingsMonthStatsOptions"
      navigate-to-name="treasury-month-stats"
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
import { TreasuryYearlyChart } from '@/components/treasury';

export default Vue.extend({
  name: 'TreasuryManage',
  components: {
    SecondaryPage,
    SecondaryPageTitle,
    ContextButton,
    ContextButtonItem,
    TreasuryYearlyChart,
    StatementNavList
  },
  data() {
    return {
      popoverParentId: 'treasury-manage-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', ['savingsMonthStatsOptions']),
    hasActiveTreasury(): boolean {
      return false;
    }
  },
  watch: {
    hasActiveTreasury(newVal: boolean) {
      if (!newVal) {
        this.replaceInactiveTreasuryRoute();
      }
    }
  },
  beforeMount() {
    if (!this.hasActiveTreasury) {
      this.replaceInactiveTreasuryRoute();
    }
  },
  methods: {
    replaceInactiveTreasuryRoute(): void {
      this.$router.replace({
        name: 'treasury-empty'
      });
    }
  }
});
</script>
