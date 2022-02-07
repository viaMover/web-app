<template>
  <section class="group tokens">
    <slot name="header">
      <h2 class="header complex">
        <pu-skeleton tag="span" width="100px" />
        <pu-skeleton tag="span" width="70px" />
      </h2>
    </slot>

    <div class="items">
      <template v-if="isLoading">
        <div v-for="idx in 4" :key="idx" class="item">
          <pu-skeleton circle class="icon token-icon" tag="div" />
          <div class="description">
            <pu-skeleton class="title" tag="h3" />
            <pu-skeleton class="value" tag="div" />
          </div>
          <pu-skeleton class="balance" tag="div" />
        </div>
      </template>
      <slot v-else></slot>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HomeWalletTokensWrapper',
  props: {
    isLoading: {
      type: Boolean,
      required: true
    }
  }
});
</script>
