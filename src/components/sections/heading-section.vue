<template>
  <section class="section" :name="name">
    <div class="labels">
      <h2 class="heading-row">
        <slot class="heading-row--text" name="heading"></slot>
      </h2>
      <template v-if="hasExpandButton">
        <router-link
          v-if="navigateToName"
          class="expand-button"
          :to="{ name: navigateToName }"
        >
          <img src="@/assets/images/arrows.svg" />
        </router-link>
        <div
          v-else-if="useClickEvent"
          class="expand-button"
          @click="handleClick"
        >
          <img src="@/assets/images/arrows.svg" />
        </div>
      </template>
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
    },
    useClickEvent: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(): void {
      this.$emit('navigation-click');
    }
  }
});
</script>
