<template>
  <section class="group collectibles">
    <slot name="header">
      <pu-skeleton class="header" tag="h2" />
    </slot>

    <div class="items product-carousel">
      <div class="items-wrapper">
        <template v-if="isLoading">
          <pu-skeleton
            v-for="idx in 4"
            :key="idx"
            class="item skeleton"
            tag="div"
          />
        </template>
        <slot v-else />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CollectiblesWrapper',
  props: {
    hasHeader: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  }
});
</script>
