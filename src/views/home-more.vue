<template>
  <content-wrapper has-left-rail wrapper-class="general-desktop">
    <governance-section v-if="isFeatureEnabled('isGovernanceEnabled')" />
    <nibble-shop-section v-if="isFeatureEnabled('isNibbleShopEnabled')" />
    <nft-drops-section v-if="isFeatureEnabled('isNftDropsEnabled')" />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import {
  GovernanceSection,
  NibbleShopSection,
  NftDropsSection
} from '@/components/sections';

export default Vue.extend({
  name: 'HomeMore',
  components: {
    ContentWrapper,
    GovernanceSection,
    NibbleShopSection,
    NftDropsSection
  },
  methods: {
    isFeatureEnabled
  }
});
</script>
