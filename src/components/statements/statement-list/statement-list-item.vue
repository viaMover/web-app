<template>
  <li class="item">
    <h3 class="description" :class="descriptionClasses">
      <slot name="description">{{ description }}</slot>
    </h3>
    <span class="value">
      <slot>{{ value }}</slot>
    </span>
  </li>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'StatementListItem',
  props: {
    description: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    },
    thinDescription: {
      type: Boolean,
      default: false
    },
    boldDescription: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    descriptionClasses(): string {
      let cls = '';
      if (this.thinDescription) {
        cls += 'thin ';
      }
      if (this.boldDescription) {
        cls += 'bold ';
      }
      return cls;
    }
  }
});
</script>
