<template>
  <div class="release-radar-desktop__menu-wrapper-item">
    <slot name="title">
      <h2>{{ title }}</h2>
    </slot>
    <slot>
      <PuSkeleton
        circle
        class="skeleton-icon"
        :count="4"
        :height="'80px'"
        :loading="isLoading"
        :tag="'div'"
        :width="'80px'"
      />
      <PuSkeleton
        class="skeleton-title"
        :count="4"
        :loading="isLoading"
        :tag="'div'"
        :width="'80px'"
      />
      <swiper
        v-if="!isLoading"
        allow-touch-move
        container-class="swiper-lists"
        grab-cursor
        mousewheel
        :slides-per-view="slidesPerView"
        :space-between="64"
        use-navigation-buttons
      >
        <release-radar-page-section-item
          v-for="item in items"
          :key="item.id"
          :image="item.icon"
          :is-black-border="item.blackBorder"
          :text="item.name"
        />
      </swiper>
    </slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import { Swiper } from '@/components/swiper';
import ReleaseRadarPageSectionItem from './release-radar-page-section-item.vue';

import { Asset } from '@/store/modules/radar/types';

export default Vue.extend({
  name: 'ReleaseRadarPageSection',
  components: {
    ReleaseRadarPageSectionItem,
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
