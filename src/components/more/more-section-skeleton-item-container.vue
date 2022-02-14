<template>
  <more-section-base-skeleton>
    <div class="item-container">
      <div class="item">
        <div class="info">
          <pu-skeleton circle class="progress-loader" tag="div" />
          <div class="text">
            <pu-skeleton class="title" tag="h3" width="200px" />
            <pu-skeleton class="description" tag="div" width="80px" />
          </div>
        </div>
        <div class="action">
          <pu-skeleton
            class="button disabled no-padding skeleton"
            height="40px"
            tag="div"
            width="80px"
          />
        </div>
      </div>
    </div>

    <pu-skeleton class="button skeleton disabled no-padding" tag="div" />
  </more-section-base-skeleton>
</template>

<script lang="ts">
import Vue from 'vue';

import MoreSectionBaseSkeleton from './more-section-base-skeleton.vue';

export default Vue.extend({
  name: 'MoreSectionSkeletonItemContainer',
  components: {
    MoreSectionBaseSkeleton
  }
});
</script>
