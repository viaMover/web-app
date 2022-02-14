<template functional>
  <pu-skeleton
    class="item picture skeleton"
    :height="props.height"
    :width="props.width"
  />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavigationSectionItemImageSkeleton',
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '48px'
    }
  }
});
</script>
