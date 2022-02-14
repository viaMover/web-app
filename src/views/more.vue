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
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import {
  MoreSectionGovernance,
  MoreSectionNftDrops,
  MoreSectionNibbleShop
} from '@/components/more';

export default Vue.extend({
  name: 'More',
  components: {
    ContentWrapper,
    MoreSectionGovernance,
    MoreSectionNibbleShop,
    MoreSectionNftDrops
  },
  methods: {
    isFeatureEnabled,
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
