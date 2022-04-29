<template>
  <div class="account">
    <div class="grid-wrapper">
      <move-section class="w-60" />
      <governance-section class="w-40" />
      <analytics-section class="w-100" />
      <promos-section class="w-40" />
      <shop-section class="w-60" />
      <nft-section class="w-100" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import AnalyticsSection from '@/components/v1.2/home/account/analytics-section.vue';
import GovernanceSection from '@/components/v1.2/home/account/governance-section.vue';
import MoveSection from '@/components/v1.2/home/account/move-section.vue';
import NftSection from '@/components/v1.2/home/account/nft-section.vue';
import PromosSection from '@/components/v1.2/home/account/promos-section.vue';
import ShopSection from '@/components/v1.2/home/account/shop-section.vue';

export default Vue.extend({
  components: {
    MoveSection,
    GovernanceSection,
    AnalyticsSection,
    PromosSection,
    ShopSection,
    NftSection
  }
});
</script>
