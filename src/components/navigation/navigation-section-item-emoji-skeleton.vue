<template functional>
  <pu-skeleton
    class="item emoji skeleton"
    :height="props.height"
    :width="props.width"
  />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NavigationSectionItemEmojiSkeleton',
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '24px'
    }
  }
});
</script>
