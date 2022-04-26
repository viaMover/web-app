<template>
  <i class="icon" :class="iconClassWithThemePostfix" />
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';

export default Vue.extend({
  name: 'BaseIcon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    skipThemePostfix: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      currentTheme: 'theme'
    }),
    iconClassWithThemePostfix(): string {
      if (this.skipThemePostfix) {
        return this.iconClass;
      }

      return `${this.iconClass}-${this.currentTheme}-theme`;
    }
  }
});
</script>
