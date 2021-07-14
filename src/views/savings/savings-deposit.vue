<template>
  <secondary-page :title="$t('savings.lblSavings')">
    <h2>{{ $t('savings.deposit.lblDepositInSavings') }}</h2>
    <div class="description">
      {{ $t('savings.deposit.txtDepositDescription') }}
    </div>
    <savings-deposit-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { SavingsDepositForm } from '@/components/forms';

export default Vue.extend({
  name: 'SavingsDeposit',
  components: {
    SecondaryPage,
    SavingsDepositForm
  }
});
</script>
