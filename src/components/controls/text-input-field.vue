<template>
  <div class="input">
    <label :for="fieldId">{{ fieldLabel }}</label>
    <input
      :id="fieldId"
      class="text"
      :placeholder="placeholder"
      type="text"
      :value="value"
      @input="updateValue($event.target.value)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TextInputField',
  props: {
    fieldId: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: ''
    },
    validationObject: {
      type: Object,
      default: undefined
    }
  },
  methods: {
    updateValue(value: never): void {
      this.$emit('input', String(value).trim());
    }
  }
});
</script>
