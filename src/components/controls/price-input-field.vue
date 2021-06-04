<template>
  <span class="input">
    <label :for="fieldId">{{ fieldLabel }}</label>
    {{ textPrefix }}
    <input
      :id="fieldId"
      class="amount"
      type="number"
      :value="amount"
      @input="updateAmount($event.target.value)"
    />
  </span>
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
      type: Number,
      required: true
    },
    textPrefix: {
      type: String,
      default: ''
    }
  },
  methods: {
    updateAmount(amount: never): void {
      try {
        this.$emit('update-amount', Number(amount));
      } catch {
        return;
      }
    }
  }
});
</script>
