<template>
  <secondary-page has-heading-buttons :title="$t('lblSavings')">
    <h2>{{ $t('savingsPage.withdraw.lblWithdrawFromSavings') }}</h2>
    <div class="description">
      {{ $t('savingsPage.withdraw.txtWithdrawDescription') }}
    </div>
    <savings-withdraw-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import SecondaryPage from '@/components/layout/secondary-page.vue';
import SavingsWithdrawForm from '@/components/forms/savings-withdraw-form.vue';

export default Vue.extend({
  name: 'SavingsWithdraw',
  components: {
    SecondaryPage,
    SavingsWithdrawForm
  }
});
</script>
