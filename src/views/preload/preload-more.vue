<template>
  <content-wrapper class="more" page-content-class="centered">
    <more-section-skeleton-item-container />
    <more-section-skeleton-slider v-for="idx in 2" :key="idx" />
    <more-section-skeleton-item-container v-if="isVaultsRaceEnabled" />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

import { isFeatureEnabled } from '@/settings';

import { ContentWrapper } from '@/components/layout';
import {
  MoreSectionSkeletonItemContainer,
  MoreSectionSkeletonSlider
} from '@/components/more';

export default Vue.extend({
  name: 'PreloadMore',
  components: {
    ContentWrapper,
    MoreSectionSkeletonSlider,
    MoreSectionSkeletonItemContainer
  },
  computed: {
    ...mapState('account', { networkInfo: 'networkInfo' }),
    isVaultsRaceEnabled(): boolean {
      return isFeatureEnabled('isVaultsRaceEnabled', this.networkInfo?.network);
    }
  }
});
</script>
