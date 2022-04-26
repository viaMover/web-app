<template>
  <router-link
    active-class="active"
    class="item emoji button-like"
    exact-active-class="active"
    :to="navigateToRoute"
  >
    <div class="icon">
      <slot name="icon"><base-icon :icon-class="iconClass" /></slot>
    </div>
    <h3 class="info" :class="textClass">
      <slot>{{ text }}</slot>
    </h3>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';

import { BaseIcon } from '@/components/v1.2';

export default Vue.extend({
  name: 'BaseItemIcon',
  components: {
    BaseIcon
  },
  props: {
    navigateTo: {
      type: [String, Object] as PropType<RawLocation | undefined>,
      default: undefined
    },
    icon: {
      type: String,
      default: ''
    },
    iconClass: {
      type: String,
      default: undefined
    },
    text: {
      type: String,
      default: ''
    },
    textClass: {
      type: String,
      default: undefined
    }
  },
  computed: {
    navigateToRoute(): RawLocation | undefined {
      if (typeof this.navigateTo === 'string') {
        return { name: this.navigateTo };
      }

      return this.navigateTo;
    }
  }
});
</script>
