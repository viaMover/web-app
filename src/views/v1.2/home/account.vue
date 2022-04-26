<template>
  <secondary-page class="account">
    <div class="grid-wrapper">
      <move-section class="w-60" />
      <governance-section class="w-40" />
      <analytics-section class="w-100" />
      <promos-section class="w-40" />
      <shop-section class="w-60" />
      <nft-section class="w-100" />
    </div>
  </secondary-page>
</template>

<script lang="ts">
import Vue from 'vue';

import { SecondaryPage } from '@/components/layout';
import {
  AnalyticsSection,
  GovernanceSection,
  MoveSection,
  NftSection,
  PromosSection,
  ShopSection
} from '@/components/v1.2/account';

export default Vue.extend({
  components: {
    SecondaryPage,
    MoveSection,
    GovernanceSection,
    AnalyticsSection,
    PromosSection,
    ShopSection,
    NftSection
  }
});
</script>
