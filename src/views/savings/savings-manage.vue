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
              navigate-to-name="home"
              :text="$t('savings.btnDeposit.emoji')"
            />
            <context-button-item
              navigate-to-name="savings-withdraw"
              :text="$t('savings.btnWithdraw.emoji')"
            />
          </context-button>
        </template>
      </secondary-page-title>
    </template>

    <savings-yearly-chart-wrapper />
    <savings-statements />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

import { SecondaryPage, SecondaryPageTitle } from '@/components/layout';
import { ContextButton, ContextButtonItem } from '@/components/buttons';
import {
  SavingsYearlyChartWrapper,
  SavingsStatements
} from '@/components/savings';

export default Vue.extend({
  name: 'SavingsManage',
  components: {
    ContextButton,
    ContextButtonItem,
    SecondaryPageTitle,
    SecondaryPage,
    SavingsYearlyChartWrapper,
    SavingsStatements
  },
  data() {
    return {
      popoverParentId: 'savings-manage-action-buttons'
    };
  },
  computed: {
    ...mapGetters('account', ['hasActiveSavings'])
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
    }
  }
});
</script>
