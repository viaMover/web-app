<template>
  <content-wrapper
    base-class="more"
    has-back-button
    wrapper-class="more__wrapper"
    @back="handleClose"
    @close="handleClose"
  >
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
  NftDropsSection,
  NibbleShopSection
} from '@/components/sections';

import '@/styles/_more.less';

export default Vue.extend({
  name: 'HomeMore',
  components: {
    ContentWrapper,
    GovernanceSection,
    NibbleShopSection,
    NftDropsSection
  },
  methods: {
    isFeatureEnabled,
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
