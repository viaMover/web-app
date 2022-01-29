<template>
  <content-wrapper
    class="more"
    has-back-button
    page-content-class="centered"
    @back="handleClose"
    @close="handleClose"
  >
    <more-section-governance />
    <more-section-nibble-shop v-if="isFeatureEnabled('isNibbleShopEnabled')" />
    <more-section-nft-drops />
    <more-section-vaults-race v-if="isFeatureEnabled('isVaultsRaceEnabled')" />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import {
  MoreSectionGovernance,
  MoreSectionNftDrops,
  MoreSectionNibbleShop,
  MoreSectionVaultsRace
} from '@/components/more';

export default Vue.extend({
  name: 'More',
  components: {
    ContentWrapper,
    MoreSectionGovernance,
    MoreSectionNibbleShop,
    MoreSectionNftDrops,
    MoreSectionVaultsRace
  },
  methods: {
    isFeatureEnabled,
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
