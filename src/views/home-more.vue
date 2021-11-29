<template>
  <content-wrapper
    base-class="more"
    has-back-button
    wrapper-class="more__wrapper"
    @back="handleClose"
    @close="handleClose"
  >
    <governance-section />
    <nibble-shop-section v-if="isFeatureEnabled('isNibbleShopEnabled')" />
    <nft-drops-section />
    <vaults-race-section v-if="isFeatureEnabled('isVaultsRaceEnabled')" />
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
import VaultsRaceSection from '@/components/sections/vaults-race-section.vue';

import '@/styles/_more.less';

export default Vue.extend({
  name: 'HomeMore',
  components: {
    VaultsRaceSection,
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
