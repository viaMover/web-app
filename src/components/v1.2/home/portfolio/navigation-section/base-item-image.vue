<template>
  <router-link
    active-class="active"
    class="item picture button-like"
    exact-active-class="active"
    :to="navigateToRoute"
  >
    <slot name="picture" />
    <div class="info">
      <slot name="title">
        <h3 v-if="title !== ''" class="title" :class="titleClass">
          {{ title }}
        </h3>
      </slot>
      <slot name="description">
        <div
          v-if="description !== ''"
          class="description"
          :class="descriptionClass"
        >
          {{ description }}
        </div>
      </slot>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { RawLocation } from 'vue-router';

export default Vue.extend({
  name: 'BaseItemImage',
  props: {
    navigateTo: {
      type: [String, Object] as PropType<RawLocation>,
      required: true
    },
    title: {
      type: String,
      default: undefined
    },
    titleClass: {
      type: String,
      default: undefined
    },
    description: {
      type: [String, Number],
      default: undefined
    },
    descriptionClass: {
      type: String,
      default: undefined
    }
  },
  computed: {
    navigateToRoute(): RawLocation {
      if (typeof this.navigateTo === 'string') {
        return { name: this.navigateTo };
      }

      return this.navigateTo;
    }
  }
});
</script>
