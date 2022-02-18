<template>
  <more-section-base-skeleton>
    <div class="product-carousel">
      <div class="swiper-wrapper">
        <pu-skeleton
          v-for="idx in 4"
          :key="idx"
          class="item skeleton"
          tag="div"
        />
      </div>
    </div>
  </more-section-base-skeleton>
</template>

<script lang="ts">
import Vue from 'vue';

import MoreSectionBaseSkeleton from './more-section-base-skeleton.vue';

export default Vue.extend({
  name: 'MoreSectionSkeletonSlider',
  components: {
    MoreSectionBaseSkeleton
  }
});
</script>
