<template>
  <secondary-page has-heading-buttons :title="$t('savings.lblSavings')">
    <h2>{{ $t('savings.withdraw.lblWithdrawFromSavings') }}</h2>
    <div class="description">
      {{ $t('savings.withdraw.txtWithdrawDescription') }}
    </div>
    <savings-withdraw-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { SavingsWithdrawForm } from '@/components/forms';

export default Vue.extend({
  name: 'SavingsWithdraw',
  components: {
    SecondaryPage,
    SavingsWithdrawForm
  }
});
</script>
