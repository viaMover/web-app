<template>
  <secondary-page has-heading-buttons :title="$t('lblSavings')">
    <template v-slot:heading-buttons>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="savings-deposit"
      >
        {{ $t('savingsPage.btnDeposit.emoji') }}
      </heading-nav-button>
      <heading-nav-button
        button-class="transparent"
        navigate-to-name="savings-withdraw"
      >
        {{ $t('savingsPage.btnWithdraw.emoji') }}
      </heading-nav-button>
    </template>

    <h2>{{ $t('savingsPage.lblManageSavings') }}</h2>
    <savings-yearly-chart />
    <savings-statements />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import SecondaryPage from '@/components/layout/secondary-page.vue';
import HeadingNavButton from '@/components/buttons/heading-nav-button.vue';
import SavingsYearlyChart from '@/components/savings/savings-yearly-chart.vue';
import SavingsStatements from '@/components/savings/savings-statements.vue';

export default Vue.extend({
  name: 'SavingsManage',
  components: {
    SecondaryPage,
    HeadingNavButton,
    SavingsYearlyChart,
    SavingsStatements
  }
});
</script>
