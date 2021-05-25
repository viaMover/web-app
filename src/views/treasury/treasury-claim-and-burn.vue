<template>
  <secondary-page has-heading-buttons :title="$t('treasury.lblSmartTreasury')">
    <h2>{{ $t('treasury.claimAndBurn.lblClaimAndBurn') }}</h2>
    <div class="description">
      {{ $t('treasury.claimAndBurn.txtClaimAndBurnDescription') }}
    </div>
    <treasury-claim-and-burn-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { TreasuryClaimAndBurnForm } from '@/components/forms';

export default Vue.extend({
  name: 'TreasuryClaimAndBurn',
  components: {
    SecondaryPage,
    TreasuryClaimAndBurnForm
  }
});
</script>
