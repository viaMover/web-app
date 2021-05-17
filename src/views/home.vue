<template>
  <div class="content-wrapper">
    <wallet-info-rail class="left rail" />
    <div class="main">
      <h1>{{ $t('lblWelcome') }}</h1>
      <div class="columns">
        <release-radar-section class="column one of two" />
        <swaps-section class="column one of two" />
      </div>
      <debit-card-section />
      <savings-section />
      <treasury-section />
      <governance-section />
      <nibble-shop-section />
      <nfts-section />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import WalletInfoRail from '@/components/wallet-info-rail/wallet-info-rail.vue';
import ReleaseRadarSection from '@/components/sections/release-radar-section.vue';
import SwapsSection from '@/components/sections/swaps-section.vue';
import DebitCardSection from '@/components/sections/debit-card-section.vue';
import SavingsSection from '@/components/sections/savings-section.vue';
import TreasurySection from '@/components/sections/treasury-section.vue';
import GovernanceSection from '@/components/sections/governance-section.vue';
import NibbleShopSection from '@/components/sections/nibble-shop-section.vue';
import NftsSection from '@/components/sections/nfts-section.vue';

export default Vue.extend({
  name: 'Home',
  components: {
    WalletInfoRail,
    ReleaseRadarSection,
    SwapsSection,
    DebitCardSection,
    SavingsSection,
    TreasurySection,
    GovernanceSection,
    NibbleShopSection,
    NftsSection
  }
});
</script>
