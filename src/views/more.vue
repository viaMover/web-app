<template>
  <content-wrapper
    class="more"
    has-back-button
    page-content-class="centered"
    @back="handleClose"
    @close="handleClose"
  >
    <more-section-governance v-if="isGovernanceEnabled" />
    <more-section-nibble-shop v-if="isNibbleShopEnabled" />
    <more-section-nft-drops v-if="isNftDropsEnabled" />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

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
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    isGovernanceEnabled(): boolean {
      return isFeatureEnabled('isGovernanceEnabled', this.networkInfo?.network);
    },
    isNibbleShopEnabled(): boolean {
      return isFeatureEnabled('isNibbleShopEnabled', this.networkInfo?.network);
    },
    isNftDropsEnabled(): boolean {
      return isFeatureEnabled('isNftDropsEnabled', this.networkInfo?.network);
    }
  },
  methods: {
    handleClose(): void {
      this.$router.back();
    }
  }
});
</script>
