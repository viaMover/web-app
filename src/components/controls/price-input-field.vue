<template>
  <div v-if="hasPrefix" :class="inputClass">
    <span :style="spanStyle">{{ textPrefix }}</span>
    <input
      :id="fieldId"
      :max="maxAmount"
      min="0"
      :placeholder="placeholder"
      :step="step"
      type="number"
      :value="amount"
      @input="updateAmount($event.target.value)"
    />
  </div>
  <input
    v-else
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
    },
    debounceTimeout: {
      type: Number,
      default: 700
    }
  },
  data() {
    return {
      amountRaw: '',
      debounce: undefined as number | undefined
    };
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
  watch: {
    amountRaw(newVal: string) {
      if (this.debounce) {
        window.clearTimeout(this.debounce);
      }
      const debounceTimeout = newVal === '' ? 0 : this.debounceTimeout;

      this.debounce = window.setTimeout(() => {
        try {
          this.$emit('update-amount', newVal);
        } catch {
          return;
        }
      }, debounceTimeout);
    }
  },
  methods: {
    updateAmount(amount: never): void {
      this.amountRaw = amount;
    }
  }
});
</script>
