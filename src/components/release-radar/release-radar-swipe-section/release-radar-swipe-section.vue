<template>
  <release-radar-page-section :title="title">
    <PuSkeleton
      circle
      class="skeleton-icon"
      :count="4"
      height="80px"
      :loading="isLoading"
      tag="div"
      width="80px"
    />
    <PuSkeleton
      class="skeleton-title"
      :count="4"
      :loading="isLoading"
      tag="div"
      width="80px"
    />
    <swiper
      v-if="!isLoading"
      allow-touch-move
      container-class="swiper-lists"
      grab-cursor
      :slides-per-view="slidesPerView"
      :space-between="64"
    >
      <release-radar-swipe-section-item
        v-for="item in items"
        :key="item.id"
        :image="item.icon"
        :is-black-border="item.blackBorder"
        :text="item.name"
      />
    </swiper>
  </release-radar-page-section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Asset } from '@/store/modules/radar/types';

import ReleaseRadarPageSection from '@/components/release-radar/release-radar-page-section.vue';
import { Swiper } from '@/components/swiper';

import ReleaseRadarSwipeSectionItem from './release-radar-swipe-section-item.vue';

export default Vue.extend({
  name: 'ReleaseRadarSwipeSection',
  components: {
    ReleaseRadarPageSection,
    ReleaseRadarSwipeSectionItem,
    Swiper
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array as PropType<Array<Asset>>,
      default: () => [] as Array<Asset>
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    slidesPerView: {
      type: Number,
      default: 5.58
    }
  }
});
</script>
