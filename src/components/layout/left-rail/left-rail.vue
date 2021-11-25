<template>
  <component :is="leftRailComponent" class="left-rail">
    <slot></slot>
  </component>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'LeftRail',
  props: {
    leftRailComponent: {
      type: String as PropType<'nav' | 'aside'>,
      default: 'nav'
    }
  }
});
</script>
