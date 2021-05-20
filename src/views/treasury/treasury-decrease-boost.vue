<template>
  <secondary-page has-heading-buttons :title="$t('lblSmartTreasury')">
    <h2>{{ $t('treasuryPage.decreaseBoost.lblDecreaseBoost') }}</h2>
    <div class="description">
      {{ $t('treasuryPage.decreaseBoost.txtDecreaseBoostDescription') }}
    </div>
    <treasury-decrease-boost-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { TreasuryDecreaseBoostForm } from '@/components/forms';

export default Vue.extend({
  name: 'TreasuryDecreaseBoost',
  components: {
    SecondaryPage,
    TreasuryDecreaseBoostForm
  }
});
</script>
