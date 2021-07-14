<template>
  <input
    :id="fieldId"
    class="native"
    :max="0"
    min="0"
    type="number"
    :value="amount"
    @input="updateAmount($event.target.value)"
  />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'NativePriceInputField',
  props: {
    fieldId: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      default: ''
    },
    amount: {
      type: String,
      required: true
    },
    textPrefix: {
      type: String,
      default: ''
    },
    maxAmount: {
      type: String,
      required: false
    }
  },
  methods: {
    updateAmount(amount: never): void {
      try {
        this.$emit('update-amount', amount);
      } catch {
        return;
      }
    }
  }
});
</script>
