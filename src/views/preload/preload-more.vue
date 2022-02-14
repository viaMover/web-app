<template>
  <content-wrapper class="more" page-content-class="centered">
    <more-section-skeleton-item-container />
    <more-section-skeleton-slider v-for="idx in 2" :key="idx" />
    <more-section-skeleton-item-container
      v-if="isFeatureEnabled('isVaultsRaceEnabled')"
    />
  </content-wrapper>
</template>

<script lang="ts">
import Vue from 'vue';

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
  methods: {
    isFeatureEnabled
  }
});
</script>
