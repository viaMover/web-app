<template>
  <div class="switch">
    <p>
      <slot>{{ text }}</slot>
    </p>
    <div class="container">
      <input
        id="shadow"
        :checked="value"
        hidden="hidden"
        type="checkbox"
        @change="handleChange($event)"
      />
      <label class="switch-button" for="shadow"></label>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'CustomSwitch',
  props: {
    text: {
      type: String,
      default: undefined
    },
    value: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    handleChange(e: InputEvent): void {
      this.$emit('input', (e.target as HTMLInputElement).checked);
    }
  }
});
</script>
