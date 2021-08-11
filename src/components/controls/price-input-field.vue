<template>
  <div>
    <span v-if="hasPrefix" :style="spanStyle">{{ textPrefix }}</span>
    <input
      :id="fieldId"
      :class="inputClass"
      :max="maxAmount"
      min="0"
      :placeholder="placeholder"
      :step="step"
      type="number"
      :value="amount"
      @input="updateAmount($event.target.value)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Properties } from 'csstype';

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
    },
    step: {
      type: String,
      required: true
    }
  },
  computed: {
    hasPrefix(): boolean {
      return this.textPrefix !== '';
    },
    spanStyle(): Properties {
      const color =
        this.amount === 'NaN' || this.amount === ''
          ? 'rgba(60, 60, 67, 0.6)'
          : '#000';
      return { color };
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
