<template>
  <input
    :id="fieldId"
    :class="inputClass"
    :max="maxAmount"
    min="0"
    :placeholder="placeholder"
    type="number"
    :value="amount"
    @input="updateAmount($event.target.value)"
  />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'PriceInputField',
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
    },
    inputClass: {
      type: String,
      required: false
    },
    placeholder: {
      type: String,
      default: ''
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
