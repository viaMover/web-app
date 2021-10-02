<template>
  <pu-skeleton
    class="left-rail-section-nav-item button-active emoji"
    color="#dcdcdc"
    height="60px"
    tag="a"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import '@/styles/_left_rail_section_nav_item.less';

export default Vue.extend({
  name: 'LeftRailSectionNavItemEmojiSkeleton'
});
</script>
