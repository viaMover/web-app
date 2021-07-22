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
              @click="handleDepositCick"
            />
            <context-button-item :text="$t('savings.btnWithdraw.emoji')" />
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
    ...mapGetters('account', ['hasActiveSavings', 'savingsMonthStatsOptions'])
  },
  watch: {
    hasActiveSavings(newVal: boolean) {
      if (!newVal) {
        this.replaceInactiveSavingsRoute();
      }
    }
  },
  beforeMount() {
    if (!this.hasActiveSavings) {
      this.replaceInactiveSavingsRoute();
    }
  },
  methods: {
    replaceInactiveSavingsRoute(): void {
      this.$router.replace({
        name: 'savings-empty'
      });
    },
    handleDepositCick(): void {
      toggleSingleItem('savings-deposit-modal');
    }
  }
});
</script>
