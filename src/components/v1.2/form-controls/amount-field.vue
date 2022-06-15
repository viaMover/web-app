<template>
  <div>
    <label class="form-label" :for="inputId">
      <slot name="label">{{ labelText }}</slot>
    </label>
    <div class="input-group">
      <input
        :id="inputId"
        ref="input"
        class="form-control"
        min="0"
        placeholder="0.00"
        :step="step"
        type="number"
        :value="amount"
        @input="handleInput"
      />
      <div class="input-group-text" @click="handleModeChange">
        {{ assetSymbol }}
      </div>
    </div>
    <p class="form-text">
      <slot name="description">{{ descriptionText }}</slot>
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'AmountField',
  props: {
    inputId: {
      type: String,
      required: true
    },
    labelText: {
      type: String,
      default: undefined
    },
    descriptionText: {
      type: String,
      default: undefined
    },
    amount: {
      type: String,
      default: '0'
    },
    assetSymbol: {
      type: String,
      required: true
    },
    assetDecimals: {
      type: Number,
      default: 18
    },
    debounceTimeout: {
      type: Number,
      default: 1000
    }
  },
  data() {
    return {
      amountRaw: '',
      debounceHandler: undefined as number | undefined
    };
  },
  computed: {
    step(): number {
      return Math.pow(10, -this.assetDecimals);
    }
  },
  watch: {
    amountRaw(newVal: string) {
      if (this.debounceHandler !== undefined) {
        window.clearTimeout(this.debounceHandler);
      }

      const debounceTimeout = newVal === '' ? 0 : this.debounceTimeout;

      this.debounceHandler = window.setTimeout(() => {
        try {
          this.$emit('input', newVal);
        } catch {
          return;
        }
      }, debounceTimeout);
    }
  },
  methods: {
    handleModeChange(): void {
      this.$emit('mode-changed');
    },
    handleInput(ev: InputEvent): void {
      this.amountRaw = (ev.target as HTMLInputElement).value;
    }
  }
});
</script>
