<template>
  <secondary-page has-heading-buttons :title="$t('savings.lblSavings')">
    <template v-slot:heading-buttons>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="savings-deposit"
      >
        {{ $t('savings.btnDeposit.emoji') }}
      </heading-nav-button>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="savings-withdraw"
      >
        {{ $t('savings.btnWithdraw.emoji') }}
      </heading-nav-button>
    </template>

    <h2>{{ $t('savings.lblManageSavings') }}</h2>
    <savings-yearly-chart-wrapper />
    <savings-statements />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { HeadingNavButton } from '@/components/buttons';
import {
  SavingsYearlyChartWrapper,
  SavingsStatements
} from '@/components/savings';
import { mapGetters } from 'vuex';

export default Vue.extend({
  name: 'SavingsManage',
  components: {
    SecondaryPage,
    HeadingNavButton,
    SavingsYearlyChartWrapper,
    SavingsStatements
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
