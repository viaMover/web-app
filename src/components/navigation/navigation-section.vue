<template>
  <section class="group">
    <h2 v-if="!hideHeader && sectionName !== undefined" class="header">
      <slot name="section-name">{{ sectionName }}</slot>
    </h2>
    <ul class="items">
      <template v-if="isLoading">
        <component
          :is="skeletonComponent"
          v-for="idx in skeletonComponentsCount"
          :key="idx"
          :height="skeletonComponentHeight"
          :width="skeletonComponentWidth"
        />
      </template>
      <template v-else>
        <slot></slot>
      </template>
    </ul>
  </section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

import NavigationSectionItemEmojiSkeleton from './navigation-section-item-emoji-skeleton.vue';
import NavigationSectionItemImageSkeleton from './navigation-section-item-image-skeleton.vue';

export default Vue.extend({
  name: 'NavigationSection',
  components: {
    NavigationSectionItemImageSkeleton,
    NavigationSectionItemEmojiSkeleton
  },
  props: {
    sectionName: {
      type: String,
      default: undefined
    },
    hideHeader: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    /**
     * @summary a component to use as a preload/skeleton
     * @description Component to use as a preload/skeleton when `isLoading` is `true`.
     * Requires component from `./components`, that should be
     * also registered as a recursive or global component
     * @default navigation-section-item-image-skeleton
     * @see NavigationSectionItemEmojiSkeleton, NavigationSectionItemImageSkeleton
     */
    skeletonComponent: {
      type: String as PropType<
        | 'navigation-section-item-image-skeleton'
        | 'navigation-section-item-emoji-skeleton'
      >,
      default: 'navigation-section-item-image-skeleton',
      validator: (componentName: string | undefined) =>
        componentName !== undefined &&
        [
          'navigation-section-item-image-skeleton',
          'navigation-section-item-emoji-skeleton'
        ].includes(componentName.trim())
    },
    skeletonComponentsCount: {
      type: Number,
      default: 1,
      validator: (count: number | undefined) => count !== undefined && count > 0
    },
    skeletonComponentWidth: {
      type: String,
      default: undefined
    },
    skeletonComponentHeight: {
      type: String,
      default: undefined
    }
  }
});
</script>
