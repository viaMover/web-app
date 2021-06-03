<template>
  <section class="section" :name="name">
    <div class="labels">
      <h2 class="heading-row">
        <slot class="heading-row--text" name="heading"></slot>
      </h2>
      <router-link
        v-if="showExpandButton"
        class="expand-button"
        :to="{ name: navigateToName }"
      >
        <img src="@/assets/images/arrows.svg" />
      </router-link>
    </div>
    <div class="heading-body">
      <slot></slot>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HeadingSection',
  props: {
    hasExpandButton: {
      type: Boolean,
      default: false
    },
    navigateToName: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: true
    }
  },
  computed: {
    showExpandButton(): boolean {
      return this.hasExpandButton && !!this.navigateToName;
    }
  }
});
</script>
