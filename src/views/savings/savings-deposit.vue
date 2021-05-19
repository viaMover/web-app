<template>
  <secondary-page has-heading-buttons :title="$t('lblSavings')">
    <h2>{{ $t('savingsPage.deposit.lblDepositInSavings') }}</h2>
    <div class="description">
      {{ $t('savingsPage.deposit.txtDepositDescription') }}
    </div>
    <savings-deposit-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import SecondaryPage from '@/components/layout/secondary-page.vue';
import SavingsDepositForm from '@/components/forms/savings-deposit-form.vue';

export default Vue.extend({
  name: 'SavingsDeposit',
  components: {
    SecondaryPage,
    SavingsDepositForm
  }
});
</script>
