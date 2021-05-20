<template>
  <secondary-page has-heading-buttons :title="$t('lblSmartTreasury')">
    <h2>{{ $t('treasuryPage.increaseBoost.lblIncreaseBoost') }}</h2>
    <div class="description">
      {{ $t('treasuryPage.increaseBoost.txtIncreaseBoostDescription.part1') }}
      <i class="move">MOVE</i>
      {{ $t('treasuryPage.increaseBoost.txtIncreaseBoostDescription.part2') }}
      <i class="move-eth-lp">MOVE-ETH LP</i>
      {{ $t('treasuryPage.increaseBoost.txtIncreaseBoostDescription.part3') }}
    </div>
    <treasury-increase-boost-form />
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import { TreasuryIncreaseBoostForm } from '@/components/forms';

export default Vue.extend({
  name: 'TreasuryIncreaseBoost',
  components: {
    SecondaryPage,
    TreasuryIncreaseBoostForm
  }
});
</script>
